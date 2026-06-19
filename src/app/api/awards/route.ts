import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** GET /api/awards?all=1 — list awards (public by default; all includes drafts) */
export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "1";
    const where: Record<string, unknown> = {};
    if (!all) where.published = true;
    const rows = await db.award.findMany({
      where,
      orderBy: { order: "asc" },
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list awards", err);
  }
}

/** POST /api/awards — create (admin) */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.label) return fail("Label is required");
    const created = await db.award.create({
      data: {
        label: body.label,
        year: body.year || "",
        note: body.note || null,
        order: Number(body.order) || 0,
        published: body.published !== false,
      },
    });
    await logActivity({
      action: "create",
      entity: "award",
      label: created.label,
      entityId: created.id,
      summary: `Created award “${created.label}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create award", err);
  }
}
