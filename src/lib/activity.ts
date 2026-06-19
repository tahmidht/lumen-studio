/**
 * Activity log helper — records a single audit-trail row for admin actions.
 *
 * Usage:
 *   import { logActivity } from "@/lib/activity";
 *   await logActivity({ req, action: "create", entity: "project", label: title, entityId: id, summary: `Created project “${title}”` });
 *
 * Failures are swallowed (the audit log must never break a successful request),
 * so callers don't need to await/try-catch unless they want to.
 */
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "duplicate"
  | "feature"
  | "unfeature"
  | "reorder"
  | "auth"
  | "config";

export type ActivityEntity =
  | "project"
  | "service"
  | "testimonial"
  | "post"
  | "gear"
  | "award"
  | "inquiry"
  | "subscriber"
  | "faq"
  | "config"
  | "auth";

export type LogActivityInput = {
  action: ActivityAction;
  entity: ActivityEntity;
  label?: string | null;
  entityId?: string | null;
  summary: string;
  /** Optional — pass to avoid an extra session lookup when the caller already has it. */
  actor?: string | null;
  /** Optional — pass the NextRequest to derive the actor from the session cookie. */
  req?: NextRequest;
};

/**
 * Resolve the actor email from the request's session cookie.
 * Falls back to the provided actor or "system".
 */
async function resolveActor(
  req?: NextRequest,
  actor?: string | null
): Promise<string | null> {
  if (actor) return actor;
  if (!req) return null;
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as { email?: string } | undefined)?.email ?? null;
  } catch {
    return null;
  }
}

/**
 * Write a single activity-log row. Never throws.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const actor = await resolveActor(input.req, input.actor);
    await db.activityLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        label: input.label ?? null,
        entityId: input.entityId ?? null,
        summary: input.summary,
        actor: actor ?? "system",
      },
    });
  } catch (err) {
    // Audit log must never break a request.
    console.error("[activity:log] failed to write activity log", err);
  }
}

/** Cursor-paginated read for the admin UI. Newest first.
 *  Also trims the log to MAX_ROWS to prevent unbounded growth. */
const MAX_ACTIVITY_ROWS = 2000;
export async function readActivity(opts?: { limit?: number; cursor?: string }) {
  const limit = Math.min(opts?.limit ?? 50, 200);

  // Auto-trim: if the log exceeds MAX_ACTIVITY_ROWS, delete the oldest surplus.
  // Cheap and idempotent — runs inline on every admin read.
  try {
    const total = await db.activityLog.count();
    if (total > MAX_ACTIVITY_ROWS) {
      const surplus = total - MAX_ACTIVITY_ROWS;
      const oldest = await db.activityLog.findMany({
        orderBy: { createdAt: "asc" },
        take: surplus,
        select: { id: true },
      });
      if (oldest.length > 0) {
        await db.activityLog.deleteMany({
          where: { id: { in: oldest.map((r) => r.id) } },
        });
      }
    }
  } catch (err) {
    console.error("[activity:trim] failed to trim activity log", err);
  }

  const rows = await db.activityLog.findMany({
    take: limit + 1,
    ...(opts?.cursor
      ? { skip: 1, cursor: { id: opts.cursor } }
      : {}),
    orderBy: { createdAt: "desc" },
  });
  const nextCursor = rows.length > limit ? rows[rows.length - 1].id : null;
  return { rows: rows.slice(0, limit), nextCursor };
}

/** Clear the entire activity log (admin "Clear log" action). Returns the count deleted. */
export async function clearActivity(): Promise<number> {
  try {
    const result = await db.activityLog.deleteMany({});
    return result.count;
  } catch (err) {
    console.error("[activity:clear] failed to clear activity log", err);
    return 0;
  }
}

/** Clear entries older than the given number of days. Returns the count deleted. */
export async function clearActivityOlderThan(days: number): Promise<number> {
  if (!Number.isFinite(days) || days <= 0) return 0;
  try {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await db.activityLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return result.count;
  } catch (err) {
    console.error("[activity:clearOlderThan] failed", err);
    return 0;
  }
}

/** Counts per action (used by the admin dashboard quick stats). */
export async function countRecentActivity(sinceHours = 24) {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
  try {
    const count = await db.activityLog.count({
      where: { createdAt: { gte: since } },
    });
    return count;
  } catch {
    return 0;
  }
}
