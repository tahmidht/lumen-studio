import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const row = await db.inquiry.findUnique({ where: { id } });
    if (!row) return fail("Inquiry not found", 404);
    // mark as read on view
    if (row.status === "NEW") {
      await db.inquiry.update({ where: { id }, data: { status: "READ" } });
    }
    return ok(row);
  } catch (err) {
    return serverError("Failed to get inquiry", err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.inquiry.findUnique({ where: { id } });
    if (!existing) return fail("Inquiry not found", 404);
    const updated = await db.inquiry.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.projectType !== undefined && {
          projectType: body.projectType || null,
        }),
        ...(body.budget !== undefined && { budget: body.budget || null }),
        ...(body.eventDate !== undefined && {
          eventDate: body.eventDate || null,
        }),
        ...(body.message !== undefined && { message: body.message }),
        ...(body.starred !== undefined && { starred: !!body.starred }),
      },
    });
    await logActivity({
      action: "update",
      entity: "inquiry",
      label: updated.name,
      entityId: updated.id,
      summary:
        body.starred !== undefined
          ? body.starred
            ? `Starred inquiry “${updated.name}”`
            : `Unstarred inquiry “${updated.name}”`
          : `Updated inquiry “${updated.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update inquiry", err);
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
    const existing = await db.inquiry.findUnique({ where: { id } });
    if (!existing) return fail("Inquiry not found", 404);
    await db.inquiry.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "inquiry",
      label: existing.name,
      entityId: id,
      summary: `Deleted inquiry “${existing.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete inquiry", err);
  }
}
