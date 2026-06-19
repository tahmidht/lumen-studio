"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Archive } from "lucide-react";
import type { Project } from "@/lib/types";
import { categoryLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Project archive — year-grouped grid with a sticky year rail.
 * Premium portfolio UX for studios with deep back-catalogs.
 */
export function ProjectArchive({ projects }: { projects: Project[] }) {
  // Group projects by year (descending). Projects without a year go into "Undated".
  const byYear = useMemo(() => {
    const map = new Map<number, Project[]>();
    const undated: Project[] = [];
    for (const p of projects) {
      if (p.year) {
        if (!map.has(p.year)) map.set(p.year, []);
        map.get(p.year)!.push(p);
      } else {
        undated.push(p);
      }
    }
    // Sort each year's projects by order then createdAt
    for (const [, list] of map) {
      list.sort((a, b) => a.order - b.order || b.createdAt.getTime() - a.createdAt.getTime());
    }
    undated.sort((a, b) => a.order - b.order || b.createdAt.getTime() - a.createdAt.getTime());
    const years = Array.from(map.keys()).sort((a, b) => b - a);
    return { years, map, undated };
  }, [projects]);

  const [activeYear, setActiveYear] = useState<string>(
    byYear.years.length > 0 ? String(byYear.years[0]) : "undated"
  );

  // Scroll-spy: highlight the year currently in view
  useEffect(() => {
    const ids = [
      ...byYear.years.map((y) => `year-${y}`),
      ...(byYear.undated.length > 0 ? ["year-undated"] : []),
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveYear(visible[0].target.id.replace("year-", ""));
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [byYear]);

  const yearRail = [
    ...byYear.years.map((y) => ({ id: String(y), label: String(y), count: byYear.map.get(y)!.length })),
    ...(byYear.undated.length > 0
      ? [{ id: "undated", label: "Undated", count: byYear.undated.length }]
      : []),
  ];

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 text-center md:px-8">
        <Archive className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 font-display text-lg font-semibold">No projects yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Published projects will appear here grouped by year.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
        {/* Sticky year rail */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1" aria-label="Years">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-6 bg-brand" />
              <span className="label-eyebrow text-brand">Timeline</span>
            </div>
            {yearRail.map((y) => (
              <a
                key={y.id}
                href={`#year-${y.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(`year-${y.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveYear(y.id);
                }}
                className={cn(
                  "flex items-baseline justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  activeYear === y.id
                    ? "bg-brand/10 font-semibold text-brand"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <span className="font-mono">{y.label}</span>
                <span className="text-xs opacity-60">{y.count}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Year sections */}
        <div className="space-y-20">
          {byYear.years.map((year) => (
            <YearSection
              key={year}
              year={year}
              projects={byYear.map.get(year)!}
            />
          ))}
          {byYear.undated.length > 0 && (
            <YearSection
              year="undated"
              projects={byYear.undated}
              label="Undated"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function YearSection({
  year,
  projects,
  label,
}: {
  year: number | string;
  projects: Project[];
  label?: string;
}) {
  return (
    <section id={`year-${year}`} className="scroll-mt-24">
      <div className="flex items-end justify-between border-b border-border pb-4">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {label ?? year}
          </h2>
          <span className="text-sm text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </span>
        </div>
        <span className="h-px flex-1 mx-4 bg-gradient-to-r from-border to-transparent" />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: Math.min(i * 0.04, 0.3),
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <ArchiveCard project={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ArchiveCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.thumbnailAlt || project.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/85">
            {categoryLabel(project.category)}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-semibold leading-tight text-white">
            {project.title}
          </h3>
          {project.client && (
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/60">
              {project.client}
            </p>
          )}
        </div>
      </div>
      {project.excerpt && (
        <p className="line-clamp-2 border-t border-border p-4 text-xs leading-relaxed text-muted-foreground">
          {project.excerpt}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <span>{project.location || "—"}</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
      </div>
    </Link>
  );
}
