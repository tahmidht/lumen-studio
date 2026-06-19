import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { readActivity, clearActivity, clearActivityOlderThan } from "@/lib/activity";
import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";

/** GET /api/activity — admin-only, cursor-paginated audit trail. */
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const url = req.nextUrl;
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const result = await readActivity({ limit, cursor });

    // Quick per-action counts for the admin header chips.
    const actionCounts = await db.activityLog.groupBy({
      by: ["action"],
      _count: { _all: true },
    });
    const counts: Record<string, number> = {};
    for (const c of actionCounts) counts[c.action] = c._count._all;

    return ok({ rows: result.rows, nextCursor: result.nextCursor, counts });
  } catch (err) {
    return serverError("Failed to read activity log", err);
  }
}

/** DELETE /api/activity — admin-only. Clears the log.
 *  Pass `?olderThanDays=N` to only clear entries older than N days
 *  (e.g. for retention hygiene). Without the query param, clears everything. */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const olderThanDays = Number(req.nextUrl.searchParams.get("olderThanDays") ?? "0");
    const deleted =
      olderThanDays > 0
        ? await clearActivityOlderThan(olderThanDays)
        : await clearActivity();
    // Log the clear action itself (after the wipe, so it survives as the single
    // most-recent entry — proves the log was intentionally cleared).
    await logActivity({
      action: "delete",
      entity: "config",
      label: "Activity log",
      entityId: null,
      summary:
        olderThanDays > 0
          ? `Cleared activity log entries older than ${olderThanDays} days (${deleted} removed)`
          : `Cleared activity log (${deleted} entries removed)`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ deleted });
  } catch (err) {
    return serverError("Failed to clear activity log", err);
  }
}

// silence unused import in some bundlers
void fail;
