import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";

/**
 * RSS 2.0 feed for the journal — serves /feed.xml.
 * Includes the 20 most recently published posts.
 */
export const revalidate = 3600; // 1 hour

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function pubDate(d: Date): string {
  // RFC 822 date format: "Wed, 02 Oct 2002 13:00:00 GMT"
  return d.toUTCString();
}

export async function GET() {
  const config = await getSiteConfig();
  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://lumen.studio";

  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const items = posts
    .map((p) => {
      const pub = p.publishedAt ?? p.createdAt;
      const url = `${base}/journal/${p.slug}`;
      const description = p.excerpt || p.content.slice(0, 280).replace(/\s+/g, " ").trim();
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate(pub)}</pubDate>
      <description>${escapeXml(description)}</description>${p.author ? `\n      <dc:creator>${escapeXml(p.author)}</dc:creator>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(config.siteName)} — Journal</title>
    <link>${escapeXml(base)}/journal</link>
    <atom:link href="${escapeXml(base)}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(config.siteTagline || config.siteDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${pubDate(new Date())}</lastBuildDate>
    <generator>LUMEN — Cinematographer Portfolio</generator>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
