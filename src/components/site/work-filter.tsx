"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { PROJECT_CATEGORIES, categoryLabel } from "@/lib/constants";
import { ProjectCard } from "@/components/site/project-card";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

export function WorkFilter({
  projects,
  revealEnabled = true,
}: {
  projects: Project[];
  revealEnabled?: boolean;
}) {
  const [active, setActive] = useState<string>("ALL");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [prevActive, setPrevActive] = useState(active);

  // Reset pagination when the filter changes (render-phase, no effect needed)
  if (active !== prevActive) {
    setPrevActive(active);
    setVisible(PAGE_SIZE);
  }

  const cats = useMemo(() => {
    const present = new Set(projects.map((p) => p.category));
    return ["ALL", ...PROJECT_CATEGORIES.filter((c) => present.has(c))];
  }, [projects]);

  const filtered = useMemo(
    () =>
      active === "ALL"
        ? projects
        : projects.filter((p) => p.category === active),
    [active, projects]
  );

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;
  const remaining = filtered.length - visible;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Filter bar */}
        <div className="mb-10 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-all",
                active === c
                  ? "border-brand bg-brand text-black"
                  : "border-border bg-card/40 text-muted-foreground hover:border-brand/50 hover:text-foreground"
              )}
            >
              {c === "ALL" ? "All Work" : categoryLabel(c)}
              <span className="ml-1.5 text-xs opacity-60">
                {c === "ALL"
                  ? projects.length
                  : projects.filter((p) => p.category === c).length}
              </span>
            </button>
          ))}
        </div>

        {/* Count + grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-24 text-center">
            <p className="text-muted-foreground">
              No projects in this category yet.
            </p>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {shown.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProjectCard project={p} index={i} revealEnabled={revealEnabled} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-7 py-3.5 text-sm font-medium transition-all hover:border-brand hover:text-brand"
                >
                  <Loader2 className="hidden h-4 w-4 group-active:animate-spin" />
                  Load more
                  <span className="text-xs text-muted-foreground">
                    ({remaining} more)
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </button>
                <p className="text-xs text-muted-foreground">
                  Showing {shown.length} of {filtered.length}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
