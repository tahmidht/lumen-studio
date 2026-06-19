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
    const row = await db.blogPost.findUnique({ where: { id } });
    if (!row) return fail("Post not found", 404);
    return ok({ ...row, tags: parseJsonArray(row.tags) });
  } catch (err) {
    return serverError("Failed to get post", err);
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
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) return fail("Post not found", 404);

    let slug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      slug = await uniqueSlug(
        body.slug,
        (s) => db.blogPost.findUnique({ where: { slug: s } }).then(Boolean),
        existing.slug
      );
    }

    const published =
      body.published !== undefined ? !!body.published : existing.published;
    let publishedAt = existing.publishedAt;
    if (body.publishedAt !== undefined) {
      publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    } else if (published && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (!published) {
      publishedAt = null;
    }

    const updated = await db.blogPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(slug !== existing.slug && { slug }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt || null }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.coverImage !== undefined && {
          coverImage: body.coverImage || null,
        }),
        ...(body.coverImageAlt !== undefined && {
          coverImageAlt: body.coverImageAlt || null,
        }),
        ...(body.tags !== undefined && {
          tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
        }),
        ...(body.author !== undefined && { author: body.author || null }),
        ...(body.published !== undefined && { published }),
        publishedAt,
      },
    });
    await logActivity({
      action:
        body.published !== undefined
          ? body.published
            ? "publish"
            : "unpublish"
          : "update",
      entity: "post",
      label: updated.title,
      entityId: updated.id,
      summary:
        body.published !== undefined
          ? body.published
            ? `Published post “${updated.title}”`
            : `Unpublished post “${updated.title}”`
          : `Updated post “${updated.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update post", err);
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
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) return fail("Post not found", 404);
    await db.blogPost.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "post",
      label: existing.title,
      entityId: id,
      summary: `Deleted post “${existing.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete post", err);
  }
}
