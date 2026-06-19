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
    const row = await db.award.findUnique({ where: { id } });
    if (!row) return fail("Award not found", 404);
    return ok(row);
  } catch (err) {
    return serverError("Failed to get award", err);
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
    const existing = await db.award.findUnique({ where: { id } });
    if (!existing) return fail("Award not found", 404);
    const updated = await db.award.update({
      where: { id },
      data: {
        ...(body.label !== undefined && { label: body.label }),
        ...(body.year !== undefined && { year: body.year }),
        ...(body.note !== undefined && { note: body.note || null }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
        ...(body.published !== undefined && { published: !!body.published }),
      },
    });
    await logActivity({
      action:
        body.published !== undefined
          ? body.published
            ? "publish"
            : "unpublish"
          : "update",
      entity: "award",
      label: updated.label,
      entityId: updated.id,
      summary:
        body.published !== undefined
          ? body.published
            ? `Published award “${updated.label}”`
            : `Unpublished award “${updated.label}”`
          : `Updated award “${updated.label}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update award", err);
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
    const existing = await db.award.findUnique({ where: { id } });
    if (!existing) return fail("Award not found", 404);
    await db.award.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "award",
      label: existing.label,
      entityId: id,
      summary: `Deleted award “${existing.label}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete award", err);
  }
}
