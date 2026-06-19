"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { categoryLabel } from "@/lib/constants";
import { RevealImage } from "@/components/site/reveal-image";

/** Reusable project card used on the landing page and portfolio listing. */
export function ProjectCard({
  project,
  index,
  revealEnabled = true,
}: {
  project: Project;
  index?: number;
  revealEnabled?: boolean;
}) {
  return (
    <Link href={`/work/${project.slug}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.6,
          delay: typeof index === "number" ? index * 0.06 : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <RevealImage
            delay={typeof index === "number" ? index * 0.08 : 0}
            className="absolute inset-0 h-full w-full"
            enabled={revealEnabled}
          >
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt={project.thumbnailAlt || project.title}
                className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-amber-950/40 to-teal-950/40" />
            )}
          </RevealImage>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/85">
              {categoryLabel(project.category)}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-brand">
                {project.year ?? ""} {project.client ? `· ${project.client}` : ""}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-white">
                {project.title}
              </h3>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-brand group-hover:text-black">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
