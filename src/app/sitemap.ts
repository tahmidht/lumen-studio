import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";

/**
 * Dynamic sitemap.xml — includes all static pages + every published project
 * and journal post. Regenerated on each request (revalidate = 1h).
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getSiteConfig();
  const base = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://lumen.studio";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/work`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/work/archive`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/journal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const [projects, posts] = await Promise.all([
    db.project.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { published: true },
      select: { slug: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/journal/${p.slug}`,
    lastModified: p.publishedAt ?? p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // keep config referenced so accent-color etc. don't tree-shake in analysis
  void config.siteName;

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
