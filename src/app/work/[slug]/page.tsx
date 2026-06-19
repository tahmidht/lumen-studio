import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, MapPin, User, Film } from "lucide-react";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { parseJsonArray, parseBtsGallery } from "@/lib/api";
import { categoryLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/site/project-card";
import { VideoEmbed } from "@/components/site/video-embed";
import { ContactCTA } from "@/components/site/contact-cta";
import { GalleryLightbox } from "@/components/site/gallery-lightbox";
import { JsonLd } from "@/components/site/json-ld";
import { ShareBar } from "@/components/site/share-bar";
import { CaseStudyHighlights } from "@/components/site/case-study-highlights";
import { BtsGallerySection } from "@/components/site/bts-gallery-section";
import type { Project } from "@/lib/types";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const row = await db.project.findUnique({ where: { slug } });
  if (!row) return { title: "Project not found" };
  return {
    title: row.title,
    description: row.excerpt ?? row.description.slice(0, 160),
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const row = await db.project.findUnique({ where: { slug } });
  if (!row || !row.published) notFound();

  const config = await getSiteConfig();
  const gallery = parseJsonArray(row.gallery);
  const btsGallery = parseBtsGallery(row.btsGallery);
  const tags = parseJsonArray(row.tags);

  // related projects (same category, exclude current)
  const relatedRows = await db.project.findMany({
    where: { published: true, category: row.category, NOT: { id: row.id } },
    take: 3,
    orderBy: { order: "asc" },
  });
  const related: Project[] = relatedRows.map((p) => ({
    ...p,
    gallery: parseJsonArray(p.gallery),
    btsGallery: parseBtsGallery(p.btsGallery),
    tags: parseJsonArray(p.tags),
  }));

  // Next/Prev navigation — by order then createdAt, wrapping around.
  // Prev = the project that comes BEFORE this one in the listing.
  // Next = the project that comes AFTER this one.
  const allPublished = await db.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, title: true, thumbnail: true, thumbnailAlt: true, category: true, year: true },
  });
  const currentIdx = allPublished.findIndex((p) => p.id === row.id);
  const prevRow = currentIdx > 0 ? allPublished[currentIdx - 1] : allPublished[allPublished.length - 1];
  const nextRow = currentIdx >= 0 && currentIdx < allPublished.length - 1 ? allPublished[currentIdx + 1] : allPublished[0];
  // Hide nav if there's only one published project
  const showNav = allPublished.length > 1;

  const project: Project = {
    ...row,
    gallery,
    btsGallery,
    tags,
  };

  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://lumen.studio";
  const projectLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: row.title,
    description: row.excerpt ?? row.description.slice(0, 300),
    url: `${base}/work/${row.slug}`,
    image: row.thumbnail || row.posterImage || undefined,
    creator: {
      "@type": "Person",
      name: row.role || config.siteName,
    },
    dateCreated: row.year ? `${row.year}` : undefined,
    keywords: tags.length ? tags.join(", ") : undefined,
    ...(row.videoUrl ? { video: { "@type": "VideoObject", url: row.videoUrl } } : {}),
  };

  return (
    <SiteShell config={config}>
      <JsonLd data={projectLd} />
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[72vh]">
          {row.posterImage || row.thumbnail ? (
             
            <img
              src={row.posterImage || row.thumbnail!}
              alt={row.thumbnailAlt || row.title}
              className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />
          <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
        </div>

        <div className="relative -mt-40 md:-mt-56">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Link
              href="/work"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-sm text-white/90 backdrop-blur-md transition-colors hover:border-brand hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" /> Back to work
            </Link>
            <div className="mt-6 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs uppercase tracking-wider text-brand backdrop-blur">
                  {categoryLabel(row.category)}
                </span>
                {row.year && (
                  <span className="text-xs text-muted-foreground">{row.year}</span>
                )}
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
                {row.title}
              </h1>
              {row.excerpt && (
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
                  {row.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Meta + video */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Meta sidebar */}
            <aside className="lg:col-span-3">
              <div className="space-y-5 rounded-xl border border-border bg-card p-6">
                <MetaItem icon={<Film className="h-4 w-4" />} label="Category" value={categoryLabel(row.category)} />
                {row.client && <MetaItem icon={<User className="h-4 w-4" />} label="Client" value={row.client} />}
                {row.role && <MetaItem icon={<User className="h-4 w-4" />} label="Role" value={row.role} />}
                {row.year && <MetaItem icon={<Calendar className="h-4 w-4" />} label="Year" value={String(row.year)} />}
                {row.location && <MetaItem icon={<MapPin className="h-4 w-4" />} label="Location" value={row.location} />}
                {tags.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <ShareBar title={row.title} className="flex-col items-start gap-2" />
                </div>
              </div>
            </aside>

            {/* Description + video */}
            <div className="lg:col-span-9">
              {row.videoUrl && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-black">
                  <VideoEmbed url={row.videoUrl} />
                </div>
              )}
              <div className="prose prose-invert max-w-none">
                <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap text-pretty md:text-lg">
                  {row.description}
                </p>
              </div>

              {gallery.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-xl font-semibold">Gallery</h2>
                  <GalleryLightbox images={gallery} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Case study highlights — horizontal scroll */}
      <CaseStudyHighlights project={project} />

      {/* Behind-the-Scenes gallery — optional, richer than the main gallery */}
      {btsGallery.length > 0 && (
        <BtsGallerySection photos={btsGallery} projectTitle={row.title} />
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-brand" />
                  <span className="label-eyebrow text-brand">More like this</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">Related work</h2>
              </div>
              <Link href="/work" className="group inline-flex items-center gap-1.5 text-sm text-brand">
                All projects
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prev / Next project navigation — premium portfolio UX */}
      {showNav && prevRow && nextRow && (
        <section className="border-t border-border">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <PrevNextCard
              dir="prev"
              href={`/work/${prevRow.slug}`}
              title={prevRow.title}
              thumbnail={prevRow.thumbnail}
              alt={prevRow.thumbnailAlt || prevRow.title}
              category={prevRow.category}
              year={prevRow.year}
            />
            <PrevNextCard
              dir="next"
              href={`/work/${nextRow.slug}`}
              title={nextRow.title}
              thumbnail={nextRow.thumbnail}
              alt={nextRow.thumbnailAlt || nextRow.title}
              category={nextRow.category}
              year={nextRow.year}
            />
          </div>
        </section>
      )}

      <ContactCTA config={config} />
    </SiteShell>
  );
}

function PrevNextCard({
  dir,
  href,
  title,
  thumbnail,
  alt,
  category,
  year,
}: {
  dir: "prev" | "next";
  href: string;
  title: string;
  thumbnail: string | null;
  alt: string;
  category: string;
  year: number | null;
}) {
  const isPrev = dir === "prev";
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-5 overflow-hidden p-6 transition-colors hover:bg-card/40 md:p-8"
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border md:h-20 md:w-32">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-950/40 to-teal-950/30" />
        )}
        <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40" />
      </div>

      {/* Text */}
      <div className={cn("min-w-0 flex-1", isPrev ? "text-left" : "text-right")}>
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs uppercase tracking-wider text-brand",
            isPrev ? "justify-start" : "justify-end"
          )}
        >
          {isPrev ? (
            <>
              <ArrowLeft className="h-3 w-3" />
              Previous
            </>
          ) : (
            <>
              Next
              <ArrowUpRight className="h-3 w-3" />
            </>
          )}
        </div>
        <h3 className="mt-1.5 truncate font-display text-lg font-semibold transition-colors group-hover:text-brand md:text-xl">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {categoryLabel(category)}
          {year ? ` · ${year}` : ""}
        </p>
      </div>
    </Link>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
