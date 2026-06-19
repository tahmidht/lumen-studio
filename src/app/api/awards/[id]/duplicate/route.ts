import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** POST /api/awards/[id]/duplicate — clone an award with "(Copy)" suffix, unpublished. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const original = await db.award.findUnique({ where: { id } });
    if (!original) return fail("Award not found", 404);

    const clone = await db.award.create({
      data: {
        label: `${original.label} (Copy)`,
        year: original.year,
        note: original.note,
        order: original.order + 1,
        published: false,
      },
    });
    await logActivity({
      action: "duplicate",
      entity: "award",
      label: clone.label,
      entityId: clone.id,
      summary: `Duplicated award “${original.label}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(clone, 201);
  } catch (err) {
    return serverError("Failed to duplicate award", err);
  }
}
