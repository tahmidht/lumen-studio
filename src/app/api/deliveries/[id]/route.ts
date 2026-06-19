import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.projectDelivery.findUnique({ where: { id } });
    if (!existing) return fail("Delivery not found", 404);

    // When status transitions to SENT, set sentAt
    const sentAt =
      body.status === "SENT" && existing.status !== "SENT"
        ? new Date()
        : existing.sentAt;

    const updated = await db.projectDelivery.update({
      where: { id },
      data: {
        ...(body.type !== undefined && { type: body.type }),
        ...(body.label !== undefined && { label: String(body.label).trim() }),
        ...(body.url !== undefined && { url: body.url || null }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.clientEmail !== undefined && { clientEmail: body.clientEmail || null }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
        ...(body.aiEmailDraft !== undefined && { aiEmailDraft: body.aiEmailDraft || null }),
        sentAt,
      },
    });
    await logActivity({
      action: "update",
      entity: "project",
      label: updated.label,
      entityId: updated.id,
      summary:
        body.status !== undefined
          ? `Marked deliverable “${updated.label}” as ${body.status}`
          : `Updated deliverable “${updated.label}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update delivery", err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const existing = await db.projectDelivery.findUnique({ where: { id } });
    if (!existing) return fail("Delivery not found", 404);
    await db.projectDelivery.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "project",
      label: existing.label,
      entityId: id,
      summary: `Deleted deliverable “${existing.label}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete delivery", err);
  }
}
