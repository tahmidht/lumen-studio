import type { MetadataRoute } from "next";

/**
 * robots.txt — allows all crawling, points to the sitemap, and blocks the
 * admin area + API from indexing.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://lumen.studio";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/uploads", "/deliver", "/p"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
