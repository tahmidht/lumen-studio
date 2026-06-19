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
    const row = await db.processStep.findUnique({ where: { id } });
    if (!row) return fail("Process step not found", 404);
    return ok(row);
  } catch (err) {
    return serverError("Failed to get process step", err);
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
    const existing = await db.processStep.findUnique({ where: { id } });
    if (!existing) return fail("Process step not found", 404);
    const updated = await db.processStep.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: String(body.title).trim() }),
        ...(body.description !== undefined && {
          description: String(body.description).trim(),
        }),
        ...(body.image !== undefined && { image: body.image || null }),
        ...(body.imageAlt !== undefined && { imageAlt: body.imageAlt || null }),
        ...(body.phase !== undefined && {
          phase: body.phase ? String(body.phase).trim() : null,
        }),
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
      entity: "config",
      label: updated.title,
      entityId: updated.id,
      summary:
        body.published !== undefined
          ? body.published
            ? `Published process step “${updated.title}”`
            : `Unpublished process step “${updated.title}”`
          : `Updated process step “${updated.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update process step", err);
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
    const existing = await db.processStep.findUnique({ where: { id } });
    if (!existing) return fail("Process step not found", 404);
    await db.processStep.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "config",
      label: existing.title,
      entityId: id,
      summary: `Deleted process step “${existing.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete process step", err);
  }
}
