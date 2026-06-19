import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError, slugify, uniqueSlug, parseJsonArray, parseBtsGallery } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** GET /api/projects?all=1 — list projects (public by default; all includes drafts) */
export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "1";
    const category = req.nextUrl.searchParams.get("category");
    const where: Record<string, unknown> = {};
    if (!all) where.published = true;
    if (category && category !== "ALL") where.category = category;

    const rows = await db.project.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    const data = rows.map((p) => ({
      ...p,
      gallery: parseJsonArray(p.gallery),
      btsGallery: parseBtsGallery(p.btsGallery),
      tags: parseJsonArray(p.tags),
    }));
    return ok(data);
  } catch (err) {
    return serverError("Failed to list projects", err);
  }
}

/** POST /api/projects — create (admin) */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    const {
      title,
      category,
      client,
      year,
      location,
      role,
      description,
      excerpt,
      thumbnail,
      thumbnailAlt,
      posterImage,
      videoUrl,
      gallery,
      btsGallery,
      tags,
      featured,
      published,
      order,
    } = body ?? {};

    if (!title || !description) return fail("Title and description are required");
    const slug = await uniqueSlug(
      body.slug || title,
      (s) => db.project.findUnique({ where: { slug: s } }).then(Boolean)
    );

    const created = await db.project.create({
      data: {
        title,
        slug,
        category: category || "FILM",
        client: client || null,
        year: year ? Number(year) : null,
        location: location || null,
        role: role || null,
        description,
        excerpt: excerpt || null,
        thumbnail: thumbnail || null,
        thumbnailAlt: thumbnailAlt || null,
        posterImage: posterImage || null,
        videoUrl: videoUrl || null,
        gallery: JSON.stringify(Array.isArray(gallery) ? gallery : []),
        btsGallery: JSON.stringify(Array.isArray(btsGallery) ? btsGallery : []),
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        featured: !!featured,
        published: published !== false,
        order: Number(order) || 0,
      },
    });
    await logActivity({
      action: "create",
      entity: "project",
      label: created.title,
      entityId: created.id,
      summary: `Created project “${created.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create project", err);
  }
}
