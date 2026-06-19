import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, User, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { ContactCTA } from "@/components/site/contact-cta";
import { Markdown } from "@/components/site/markdown";
import { JsonLd } from "@/components/site/json-ld";
import { ShareBar } from "@/components/site/share-bar";
import { ReadingProgress } from "@/components/site/reading-progress";
import { TableOfContents } from "@/components/site/table-of-contents";
import { parseJsonArray } from "@/lib/api";
import { readingTimeLabel } from "@/lib/reading";
import { extractToc } from "@/lib/toc";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const row = await db.blogPost.findUnique({ where: { slug } });
  if (!row) return { title: "Post not found" };
  return { title: row.title, description: row.excerpt ?? undefined };
}

export default async function JournalPostPage({ params }: Params) {
  const { slug } = await params;
  const row = await db.blogPost.findUnique({ where: { slug } });
  if (!row || !row.published) notFound();

  const config = await getSiteConfig();
  const tags = parseJsonArray(row.tags);
  const date = row.publishedAt ?? row.createdAt;

  // Related posts — prioritize tag matches, fall back to most recent.
  // SQLite doesn't have array-overlap, so we fetch all published posts
  // (excluding the current one) and score them by shared-tag count in JS.
  const candidateRows = await db.blogPost.findMany({
    where: { published: true, NOT: { id: row.id } },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
  const scored = candidateRows
    .map((p) => {
      const pTags = parseJsonArray(p.tags);
      const shared = pTags.filter((t) => tags.includes(t)).length;
      return { post: p, shared, tags: pTags };
    })
    .sort((a, b) => {
      const aTime = a.post.publishedAt?.getTime() ?? a.post.createdAt.getTime();
      const bTime = b.post.publishedAt?.getTime() ?? b.post.createdAt.getTime();
      return b.shared - a.shared || bTime - aTime;
    });
  const related = scored.slice(0, 3).map((s) => ({
    ...s.post,
    tags: s.tags,
    _sharedTags: s.shared,
  }));

  // table-of-contents headings from the markdown content
  const toc = extractToc(row.content);

  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://lumen.studio";
  const postLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: row.title,
    description: row.excerpt ?? undefined,
    url: `${base}/journal/${row.slug}`,
    image: row.coverImage || undefined,
    datePublished: row.publishedAt?.toISOString() ?? row.createdAt.toISOString(),
    dateModified: row.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: row.author || config.siteName,
    },
    keywords: tags.length ? tags.join(", ") : undefined,
    publisher: {
      "@type": "Organization",
      name: config.siteName,
    },
  };

  return (
    <SiteShell config={config}>
      <JsonLd data={postLd} />
      <ReadingProgress />
      <article>
        {/* Header */}
        <section className="border-b border-border py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <Link href="/journal" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-brand hover:text-brand">
              <ArrowLeft className="h-4 w-4" /> Back to journal
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand" />
                {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              {row.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand" />
                  {row.author}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand" />
                {readingTimeLabel(row.content)}
              </span>
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl">
              {row.title}
            </h1>
            {row.excerpt && (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
                {row.excerpt}
              </p>
            )}
          </div>
        </section>

        {/* Cover */}
        {row.coverImage && (
          <section className="py-10">
            <div className="mx-auto max-w-5xl px-5 md:px-8">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
                { }
                <img src={row.coverImage} alt={row.coverImageAlt || row.title} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </div>
          </section>
        )}

        {/* Content + TOC */}
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
              {/* Article body */}
              <div className="max-w-3xl lg:max-w-none">
                <Markdown content={row.content} />

                {tags.length > 0 && (
                  <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-8">
                    {tags.map((t) => (
                      <span key={t} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
                  <ShareBar title={row.title} />
                </div>
              </div>

              {/* TOC sidebar */}
              <aside className="lg:pt-2">
                <TableOfContents headings={toc} />
              </aside>
            </div>
          </div>
        </section>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-border py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-brand" />
                  <span className="label-eyebrow text-brand">Keep reading</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">
                  {related.some((p) => p._sharedTags > 0)
                    ? "Related stories"
                    : "More from the journal"}
                </h2>
              </div>
              <Link
                href="/journal"
                className="group hidden items-center gap-1.5 text-sm text-brand sm:inline-flex"
              >
                All stories
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => {
                const pDate = p.publishedAt ?? p.createdAt;
                return (
                  <Link
                    key={p.id}
                    href={`/journal/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-brand/40"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {p.coverImage ? (
                         
                        <img
                          src={p.coverImage}
                          alt={p.coverImageAlt || p.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/40" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {pDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {p._sharedTags > 0 && (
                          <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                            {p._sharedTags} shared tag{p._sharedTags === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                          {p.excerpt}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm text-brand">
                        Read
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <ContactCTA config={config} />
    </SiteShell>
  );
}
