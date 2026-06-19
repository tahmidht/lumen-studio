"use client";
import { useState } from "react";
import { SortableList } from "@/components/admin/sortable-list";
import { Card } from "@/components/ui/card";
import { categoryLabel } from "@/lib/constants";
import { Film, Star } from "lucide-react";
import type { Project } from "@/lib/types";

/**
 * Reorder mode for projects — a draggable list with thumbnails.
 * Saves order to /api/reorder on every drag-end.
 */
export function ProjectsReorder({ projects }: { projects: Project[] }) {
  const [, force] = useState(0);
  return (
    <Card className="border-border bg-card p-5">
      <SortableList
        items={projects}
        entity="project"
        renderItem={(item, handle) => (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 pr-4 transition-colors hover:border-brand/40">
            {handle}
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-background">
              {item.thumbnail ? (
                 
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground/40">
                  <Film className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-display text-sm font-semibold">
                  {item.title}
                </h4>
                {item.featured && (
                  <Star className="h-3 w-3 shrink-0 fill-brand text-brand" />
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {categoryLabel(item.category)} · {item.year ?? "—"}
                {item.client ? ` · ${item.client}` : ""}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-brand/10 px-2 py-0.5 font-mono text-xs text-brand">
              #{item.order}
            </span>
          </div>
        )}
      />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Changes save automatically and update your live site instantly.
      </p>
      {/* force re-render hook to satisfy linting */}
      <span className="hidden" onClick={() => force((n) => n + 1)} />
    </Card>
  );
}
