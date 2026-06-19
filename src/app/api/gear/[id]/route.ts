import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await db.gear.findUnique({ where: { id } });
    if (!row) return fail("Gear not found", 404);
    return ok(row);
  } catch (err) {
    return serverError("Failed to get gear", err);
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
    const existing = await db.gear.findUnique({ where: { id } });
    if (!existing) return fail("Gear not found", 404);
    const updated = await db.gear.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.brand !== undefined && { brand: body.brand || null }),
        ...(body.description !== undefined && {
          description: body.description || null,
        }),
        ...(body.image !== undefined && { image: body.image || null }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
      },
    });
    await logActivity({
      action: "update",
      entity: "gear",
      label: updated.name,
      entityId: updated.id,
      summary: `Updated gear “${updated.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update gear", err);
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
    const existing = await db.gear.findUnique({ where: { id } });
    if (!existing) return fail("Gear not found", 404);
    await db.gear.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "gear",
      label: existing.name,
      entityId: id,
      summary: `Deleted gear “${existing.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete gear", err);
  }
}
