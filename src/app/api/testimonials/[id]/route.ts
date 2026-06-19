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
    const row = await db.testimonial.findUnique({ where: { id } });
    if (!row) return fail("Testimonial not found", 404);
    return ok(row);
  } catch (err) {
    return serverError("Failed to get testimonial", err);
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
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) return fail("Testimonial not found", 404);
    const updated = await db.testimonial.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.role !== undefined && { role: body.role || null }),
        ...(body.company !== undefined && { company: body.company || null }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.rating !== undefined && { rating: Number(body.rating) || 5 }),
        ...(body.avatar !== undefined && { avatar: body.avatar || null }),
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
      entity: "testimonial",
      label: updated.name,
      entityId: updated.id,
      summary:
        body.published !== undefined
          ? body.published
            ? `Published testimonial “${updated.name}”`
            : `Unpublished testimonial “${updated.name}”`
          : `Updated testimonial “${updated.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update testimonial", err);
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
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) return fail("Testimonial not found", 404);
    await db.testimonial.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "testimonial",
      label: existing.name,
      entityId: id,
      summary: `Deleted testimonial “${existing.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete testimonial", err);
  }
}
