"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Camera, MapPin, Calendar, Clapperboard } from "lucide-react";
import type { Project } from "@/lib/types";
import { categoryLabel } from "@/lib/constants";

/**
 * Horizontal-scroll "case study" highlights — a premium storytelling band
 * on the project detail page. As the reader scrolls, the panel translates
 * horizontally, revealing curated project facts (category, client, role,
 * year, location) as large cinematic cards. Falls back gracefully if there
 * isn't enough data.
 */
export function CaseStudyHighlights({ project }: { project: Project }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const cards = [
    {
      icon: Clapperboard,
      label: "Category",
      value: categoryLabel(project.category),
    },
    project.client && { icon: Camera, label: "Client", value: project.client },
    project.role && { icon: ArrowRight, label: "Role", value: project.role },
    project.year && { icon: Calendar, label: "Year", value: String(project.year) },
    project.location && { icon: MapPin, label: "Location", value: project.location },
  ].filter(Boolean) as {
    icon: typeof Camera;
    label: string;
    value: string;
  }[];

  // translate from 0% to -(cards-1)/cards * 100% so the last card aligns right.
  // Hook must run unconditionally (before any early return).
  const trackWidth = `${Math.max(cards.length, 1) * 60}vw`;
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(Math.max(cards.length - 1, 0) / Math.max(cards.length, 1)) * 100}%`]
  );

  if (cards.length < 2) return null;

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${cards.length * 30}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* heading */}
        <div className="pointer-events-none absolute left-5 top-24 z-10 md:left-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-brand" />
            <span className="label-eyebrow text-brand">Case study</span>
          </div>
        </div>

        <motion.div
          className="flex gap-6 px-5 md:px-8"
          style={{ x, width: trackWidth }}
        >
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="relative flex h-[60vh] w-[60vw] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12"
              >
                {/* ambient glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand/10 blur-[80px]" />
                <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.04] mix-blend-overlay" />

                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-6 label-eyebrow text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold leading-tight text-balance md:text-5xl">
                    {c.value}
                  </p>
                </div>

                <div className="relative flex items-center justify-between">
                  <span className="font-mono text-xs text-brand/60">
                    {String(i + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
                  </span>
                  {project.thumbnail && (
                    <div className="h-12 w-20 overflow-hidden rounded-md border border-border">
                      { }
                      <img
                        src={project.thumbnail}
                        alt=""
                        className="h-full w-full object-cover opacity-60"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
