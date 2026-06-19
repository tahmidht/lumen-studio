import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError, uniqueSlug } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/**
 * POST /api/projects/[id]/duplicate — clone a project with a new slug +
 * "(Copy)" title suffix. All other fields (description, media, gallery,
 * tags, category, etc.) are copied. The clone is unpublished by default so
 * the admin can edit before publishing.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const original = await db.project.findUnique({ where: { id } });
    if (!original) return fail("Project not found", 404);

    const newTitle = `${original.title} (Copy)`;
    const slug = await uniqueSlug(
      `${original.slug}-copy`,
      (s) => db.project.findUnique({ where: { slug: s } }).then(Boolean)
    );

    const clone = await db.project.create({
      data: {
        title: newTitle,
        slug,
        category: original.category,
        client: original.client,
        year: original.year,
        location: original.location,
        role: original.role,
        description: original.description,
        excerpt: original.excerpt,
        thumbnail: original.thumbnail,
        thumbnailAlt: original.thumbnailAlt,
        posterImage: original.posterImage,
        videoUrl: original.videoUrl,
        gallery: original.gallery,
        btsGallery: original.btsGallery,
        tags: original.tags,
        featured: false, // don't auto-feature the copy
        published: false, // unpublished until the admin reviews it
        order: original.order + 1,
      },
    });
    await logActivity({
      action: "duplicate",
      entity: "project",
      label: clone.title,
      entityId: clone.id,
      summary: `Duplicated project “${original.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(clone, 201);
  } catch (err) {
    return serverError("Failed to duplicate project", err);
  }
}

