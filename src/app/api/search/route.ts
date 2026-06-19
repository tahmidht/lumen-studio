import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, parseJsonArray } from "@/lib/api";
import { categoryLabel } from "@/lib/constants";

/**
 * GET /api/search?q=...
 * Public site-wide search across published projects + blog posts.
 *
 * Uses DB-level `contains` filtering (LIKE) for the initial match, then
 * scores + ranks in JS. Supports multi-word queries (all words must match,
 * in any field). Case-insensitive for ASCII (SQLite LIKE default).
 *
 * Returns a ranked, capped list of results.
 */
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) return ok({ results: [] });

    // Split into words for multi-word search (AND logic)
    const words = q.split(/\s+/).filter((w) => w.length >= 2);
    if (words.length === 0) return ok({ results: [] });

    // Build Prisma where: each word must match in at least one field (OR within fields, AND across words).
    // For SQLite, `contains` maps to LIKE '%word%' (case-insensitive for ASCII).
    const projectWhere = {
      published: true,
      AND: words.map((word) => ({
        OR: [
          { title: { contains: word } },
          { description: { contains: word } },
          { excerpt: { contains: word } },
          { client: { contains: word } },
          { location: { contains: word } },
          { category: { contains: word } },
          { tags: { contains: word } },
        ],
      })),
    };

    const postWhere = {
      published: true,
      AND: words.map((word) => ({
        OR: [
          { title: { contains: word } },
          { excerpt: { contains: word } },
          { content: { contains: word } },
          { tags: { contains: word } },
        ],
      })),
    };

    const [projects, posts] = await Promise.all([
      db.project.findMany({
        where: projectWhere,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          client: true,
          location: true,
          year: true,
          excerpt: true,
          description: true,
          tags: true,
          thumbnail: true,
        },
        take: 50, // cap at 50 for scoring
      }),
      db.blogPost.findMany({
        where: postWhere,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          coverImage: true,
          publishedAt: true,
          tags: true,
        },
        take: 50,
      }),
    ]);

    type Result = {
      type: "project" | "post";
      id: string;
      title: string;
      href: string;
      subtitle: string;
      image: string | null;
      meta: string;
      score: number;
    };

    const results: Result[] = [];
    const terms = words.map((w) => w.toLowerCase());

    for (const p of projects) {
      const tags = parseJsonArray(p.tags);
      const titleLower = p.title.toLowerCase();
      let score = 0;

      // Score: title match is highest, then exact start, then client/tag/location
      for (const term of terms) {
        if (titleLower.includes(term)) {
          score += 10;
          if (titleLower.startsWith(term)) score += 5;
        }
        if ((p.client ?? "").toLowerCase().includes(term)) score += 4;
        if (tags.some((t) => t.toLowerCase().includes(term))) score += 3;
        if ((p.location ?? "").toLowerCase().includes(term)) score += 3;
        if (p.category.toLowerCase().includes(term)) score += 2;
      }
      score += 1; // baseline match

      results.push({
        type: "project",
        id: p.id,
        title: p.title,
        href: `/work/${p.slug}`,
        subtitle: p.excerpt || p.description.slice(0, 100),
        image: p.thumbnail,
        meta: `${categoryLabel(p.category)}${p.year ? ` · ${p.year}` : ""}`,
        score,
      });
    }

    for (const post of posts) {
      const tags = parseJsonArray(post.tags);
      const titleLower = post.title.toLowerCase();
      let score = 0;

      for (const term of terms) {
        if (titleLower.includes(term)) {
          score += 10;
          if (titleLower.startsWith(term)) score += 5;
        }
        if (tags.some((t) => t.toLowerCase().includes(term))) score += 3;
        if ((post.excerpt ?? "").toLowerCase().includes(term)) score += 2;
      }
      score += 1;

      results.push({
        type: "post",
        id: post.id,
        title: post.title,
        href: `/journal/${post.slug}`,
        subtitle: post.excerpt || post.content.slice(0, 100),
        image: post.coverImage,
        meta: `Journal${post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}`,
        score,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return ok({ results: results.slice(0, 12) });
  } catch (err) {
    return serverError("Search failed", err);
  }
}
