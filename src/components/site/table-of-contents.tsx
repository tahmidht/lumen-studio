"use client";
import { useState, useEffect } from "react";
import type { TocHeading } from "@/lib/toc";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

/**
 * Sticky table-of-contents for long journal posts.
 * - Renders a list of anchor links to H2/H3 headings.
 * - Scroll-spy: highlights the heading currently in view.
 * - Hidden on screens smaller than `lg` (where there's no sidebar room).
 */
export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the topmost heading that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        // trigger when heading is near the top third of the viewport
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      className="sticky top-24 hidden lg:block"
      aria-label="Table of contents"
    >
      <div className="rounded-xl border border-border bg-card/40 p-5">
        <div className="flex items-center gap-2">
          <List className="h-3.5 w-3.5 text-brand" />
          <span className="label-eyebrow text-brand">On this page</span>
        </div>
        <ul className="mt-4 space-y-1.5 border-l border-border">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActive(h.id);
                  }
                }}
                className={cn(
                  "-ml-px block border-l-2 py-1 text-sm transition-colors",
                  h.level === 3 ? "pl-6" : "pl-4",
                  active === h.id
                    ? "border-brand font-medium text-brand"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
