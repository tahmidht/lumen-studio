import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** PATCH /api/subscribers/[id] — toggle active (admin) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.subscriber.findUnique({ where: { id } });
    if (!existing) return fail("Subscriber not found", 404);
    const updated = await db.subscriber.update({
      where: { id },
      data: {
        ...(body.active !== undefined && { active: !!body.active }),
      },
    });
    await logActivity({
      action: "update",
      entity: "subscriber",
      label: updated.email,
      entityId: updated.id,
      summary: `Updated subscriber ${updated.email}`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update subscriber", err);
  }
}

/** DELETE /api/subscribers/[id] — delete (admin) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const existing = await db.subscriber.findUnique({ where: { id } });
    if (!existing) return fail("Subscriber not found", 404);
    await db.subscriber.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "subscriber",
      label: existing.email,
      entityId: id,
      summary: `Deleted subscriber ${existing.email}`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete subscriber", err);
  }
}
