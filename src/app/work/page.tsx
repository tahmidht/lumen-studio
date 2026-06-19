import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { ProjectCard } from "@/components/site/project-card";
import { WorkFilter } from "@/components/site/work-filter";
import { parseJsonArray, parseBtsGallery } from "@/lib/api";
import type { Project } from "@/lib/types";

export const revalidate = 60;

async function getData() {
  const [config, rows] = await Promise.all([
    getSiteConfig(),
    db.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);
  const projects: Project[] = rows.map((p) => ({
    ...p,
    gallery: parseJsonArray(p.gallery),
    btsGallery: parseBtsGallery(p.btsGallery),
    tags: parseJsonArray(p.tags),
  }));
  return { config, projects };
}

export default async function WorkPage() {
  const { config, projects } = await getData();
  return (
    <SiteShell config={config}>
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Portfolio</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
              Selected Work
            </h1>
            <Link
              href="/work/archive"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
            >
              View archive
              <span className="text-xs opacity-60">({projects.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            A growing archive of films — weddings, commercials, documentaries,
            and brand stories shot across the globe.
          </p>
        </div>
      </section>

      <WorkFilter
        projects={projects}
        revealEnabled={config.featureFlags?.imageReveal ?? true}
      />
    </SiteShell>
  );
}
