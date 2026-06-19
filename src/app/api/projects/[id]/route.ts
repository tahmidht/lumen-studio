import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError, slugify, uniqueSlug, parseJsonArray, parseBtsGallery } from "@/lib/api";
import { logActivity } from "@/lib/activity";

function pickAction(existing: { published: boolean }, published?: boolean) {
  if (published === undefined) return "update" as const;
  if (published && !existing.published) return "publish" as const;
  if (!published && existing.published) return "unpublish" as const;
  return "update" as const;
}

/** GET /api/projects/[id] — get one by id */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await db.project.findUnique({ where: { id } });
    if (!row) return fail("Project not found", 404);
    return ok({
      ...row,
      gallery: parseJsonArray(row.gallery),
      btsGallery: parseBtsGallery(row.btsGallery),
      tags: parseJsonArray(row.tags),
    });
  } catch (err) {
    return serverError("Failed to get project", err);
  }
}

/** PATCH /api/projects/[id] — update (admin) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) return fail("Project not found", 404);

    let slug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      slug = await uniqueSlug(
        body.slug,
        (s) => db.project.findUnique({ where: { slug: s } }).then(Boolean),
        existing.slug
      );
    } else if (body.title && !body.slug) {
      slug = await uniqueSlug(
        body.title,
        (s) => db.project.findUnique({ where: { slug: s } }).then(Boolean),
        existing.slug
      );
    }

    const updated = await db.project.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(slug !== existing.slug && { slug }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.client !== undefined && { client: body.client || null }),
        ...(body.year !== undefined && {
          year: body.year ? Number(body.year) : null,
        }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.role !== undefined && { role: body.role || null }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt || null }),
        ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail || null }),
        ...(body.thumbnailAlt !== undefined && { thumbnailAlt: body.thumbnailAlt || null }),
        ...(body.posterImage !== undefined && {
          posterImage: body.posterImage || null,
        }),
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl || null }),
        ...(body.gallery !== undefined && {
          gallery: JSON.stringify(
            Array.isArray(body.gallery) ? body.gallery : []
          ),
        }),
        ...(body.btsGallery !== undefined && {
          btsGallery: JSON.stringify(
            Array.isArray(body.btsGallery) ? body.btsGallery : []
          ),
        }),
        ...(body.tags !== undefined && {
          tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
        }),
        ...(body.featured !== undefined && { featured: !!body.featured }),
        ...(body.published !== undefined && { published: !!body.published }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
      },
    });
    await logActivity({
      action: pickAction(existing, body.published),
      entity: "project",
      label: updated.title,
      entityId: updated.id,
      summary:
        body.published !== undefined
          ? body.published
            ? `Published project “${updated.title}”`
            : `Unpublished project “${updated.title}”`
          : `Updated project “${updated.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update project", err);
  }
}

/** DELETE /api/projects/[id] — delete (admin) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) return fail("Project not found", 404);
    await db.project.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "project",
      label: existing.title,
      entityId: id,
      summary: `Deleted project “${existing.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete project", err);
  }
}
