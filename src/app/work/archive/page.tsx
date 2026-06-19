import Link from "next/link";
import { ArrowLeft, Archive } from "lucide-react";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { ProjectArchive } from "@/components/site/project-archive";
import { parseJsonArray, parseBtsGallery } from "@/lib/api";
import type { Project } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Archive",
  description:
    "Every project, grouped by year — a growing archive of films shot across the globe.",
};

export default async function ArchivePage() {
  const [config, rows] = await Promise.all([
    getSiteConfig(),
    db.project.findMany({
      where: { published: true },
      orderBy: [{ year: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    }),
  ]);
  const projects: Project[] = rows.map((p) => ({
    ...p,
    gallery: parseJsonArray(p.gallery),
    btsGallery: parseBtsGallery(p.btsGallery),
    tags: parseJsonArray(p.tags),
  }));

  return (
    <SiteShell config={config}>
      {/* Hero */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-brand hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" /> Back to work
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Archive</span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
            The full archive
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Every film, grouped by year. A growing record of weddings,
            commercials, documentaries, and brand stories shot across the globe.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Archive className="h-4 w-4 text-brand" />
            {projects.length} project{projects.length === 1 ? "" : "s"} ·{" "}
            {new Set(projects.map((p) => p.year).filter(Boolean)).size} year
            {projects.filter((p) => p.year).length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <ProjectArchive projects={projects} />
    </SiteShell>
  );
}
