"use client";
import { useState } from "react";
import { LayoutGrid, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectsReorder } from "@/components/admin/projects-reorder";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowUpRight, Star, Film } from "lucide-react";
import { categoryLabel } from "@/lib/constants";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import type { Project } from "@/lib/types";

/**
 * Projects manager: toggle between a visual grid and a drag-to-reorder list.
 */
export function ProjectsManager({ projects }: { projects: Project[] }) {
  const [mode, setMode] = useState<"grid" | "reorder">("grid");

  if (projects.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 border-dashed border-border bg-card py-20 text-center">
        <Film className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-display text-lg font-semibold">No projects yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add your first film to start building your portfolio.
        </p>
        <Link
          href="/admin/projects/new"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black"
        >
          <Film className="h-4 w-4" />
          New Project
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </p>
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setMode("grid")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "grid"
                ? "bg-brand text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            onClick={() => setMode("reorder")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "reorder"
                ? "bg-brand text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Reorder
          </button>
        </div>
      </div>

      {mode === "reorder" ? (
        <ProjectsReorder projects={projects} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Card
              key={p.id}
              className="group relative overflow-hidden border-border bg-card p-0"
            >
              <Link href={`/admin/projects/${p.id}`} className="block">
                <div className="relative aspect-video overflow-hidden">
                  {p.thumbnail ? (
                     
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-950/30 to-teal-950/30 text-muted-foreground/40">
                      <Film className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur">
                      {categoryLabel(p.category)}
                    </span>
                    {p.featured && (
                      <span className="flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase text-black">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>
                  {!p.published && (
                    <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      Draft
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/60">
                      {p.year ?? "—"} {p.client ? `· ${p.client}` : ""}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold text-white">
                      {p.title}
                    </h3>
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                <Link
                  href={`/work/${p.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand"
                >
                  View live <ArrowUpRight className="h-3 w-3" />
                </Link>
                <div className="flex items-center gap-2">
                  <DuplicateButton
                    endpoint={`/api/projects/${p.id}/duplicate`}
                    editHref="/admin/projects"
                  />
                  <DeleteButton
                    endpoint={`/api/projects/${p.id}`}
                    size="sm"
                    label="Delete"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
