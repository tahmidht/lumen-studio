import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError, uniqueSlug, parseJsonArray } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await db.service.findUnique({ where: { id } });
    if (!row) return fail("Service not found", 404);
    return ok({ ...row, features: parseJsonArray(row.features) });
  } catch (err) {
    return serverError("Failed to get service", err);
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
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return fail("Service not found", 404);

    let slug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      slug = await uniqueSlug(
        body.slug,
        (s) => db.service.findUnique({ where: { slug: s } }).then(Boolean),
        existing.slug
      );
    }

    const updated = await db.service.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(slug !== existing.slug && { slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.icon !== undefined && { icon: body.icon || null }),
        ...(body.features !== undefined && {
          features: JSON.stringify(
            Array.isArray(body.features) ? body.features : []
          ),
        }),
        ...(body.priceFrom !== undefined && {
          priceFrom: body.priceFrom || null,
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
      entity: "service",
      label: updated.title,
      entityId: updated.id,
      summary:
        body.published !== undefined
          ? body.published
            ? `Published service “${updated.title}”`
            : `Unpublished service “${updated.title}”`
          : `Updated service “${updated.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update service", err);
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
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return fail("Service not found", 404);
    await db.service.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "service",
      label: existing.title,
      entityId: id,
      summary: `Deleted service “${existing.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete service", err);
  }
}
