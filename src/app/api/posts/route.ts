import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError, uniqueSlug, parseJsonArray } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "1";
    const where: Record<string, unknown> = {};
    if (!all) where.published = true;
    const rows = await db.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });
    return ok(
      rows.map((p) => ({ ...p, tags: parseJsonArray(p.tags) }))
    );
  } catch (err) {
    return serverError("Failed to list posts", err);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.title || !body.content)
      return fail("Title and content are required");
    const slug = await uniqueSlug(
      body.slug || body.title,
      (s) => db.blogPost.findUnique({ where: { slug: s } }).then(Boolean)
    );
    const published = body.published !== false;
    const created = await db.blogPost.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content,
        coverImage: body.coverImage || null,
        coverImageAlt: body.coverImageAlt || null,
        tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
        author: body.author || null,
        published,
        publishedAt: published
          ? body.publishedAt
            ? new Date(body.publishedAt)
            : new Date()
          : null,
      },
    });
    await logActivity({
      action: "create",
      entity: "post",
      label: created.title,
      entityId: created.id,
      summary: `Created post “${created.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create post", err);
  }
}
