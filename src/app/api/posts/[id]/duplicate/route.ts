import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError, uniqueSlug } from "@/lib/api";

/** POST /api/posts/[id]/duplicate — clone a journal post with a new slug. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const original = await db.blogPost.findUnique({ where: { id } });
    if (!original) return fail("Post not found", 404);

    const slug = await uniqueSlug(
      `${original.slug}-copy`,
      (s) => db.blogPost.findUnique({ where: { slug: s } }).then(Boolean)
    );

    const clone = await db.blogPost.create({
      data: {
        title: `${original.title} (Copy)`,
        slug,
        excerpt: original.excerpt,
        content: original.content,
        coverImage: original.coverImage,
        coverImageAlt: original.coverImageAlt,
        tags: original.tags,
        author: original.author,
        published: false,
      },
    });
    return ok(clone, 201);
  } catch (err) {
    return serverError("Failed to duplicate post", err);
  }
}
