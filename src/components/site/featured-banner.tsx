"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Play, ChevronDown } from "lucide-react";
import type { Project, SiteConfig } from "@/lib/types";
import { categoryLabel } from "@/lib/constants";
import { Magnetic } from "@/components/site/magnetic";

/**
 * Featured Banner — a full-width cinematic "Project of the Month" band.
 * Sits between the marquee and the featured-work grid on the homepage.
 *
 * Visually distinct from the project cards: taller, parallax background,
 * big display headline, ambient grain, asymmetric layout. Admin-selectable
 * via Settings → Homepage Banner (config.bannerProjectId).
 */
export function FeaturedBanner({
  project,
  config,
}: {
  project: Project;
  config: SiteConfig;
}) {
  const { scrollY } = useScroll();
  // Parallax: background drifts up slower than content
  const bgY = useTransform(scrollY, [0, 700], [0, 140]);
  const contentY = useTransform(scrollY, [0, 600], [0, 60]);
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const headline = config.bannerHeadline || project.title;
  const poster = project.posterImage || project.thumbnail;
  const magneticOn = config.featureFlags?.magneticButtons ?? true;

  const CTA = (
    <Link
      href={`/work/${project.slug}`}
      className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-black transition-all hover:brightness-110"
    >
      {config.bannerCtaLabel || "View the case study"}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );

  return (
    <section className="relative overflow-hidden border-y border-border">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY }}
        aria-hidden
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            className="h-[120%] w-full object-cover animate-ken-burns"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-950/40 via-background to-teal-950/30" />
        )}
        {/* Cinematic scrims — dark so white text reads on top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-grain opacity-[0.08] mix-blend-overlay" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-end px-5 py-16 md:px-8 md:py-24"
      >
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">
              {config.bannerEyebrow || "Featured Story"}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/85 backdrop-blur-md">
              {categoryLabel(project.category)}
            </span>
          </motion.div>

          {/* Headline — with subtle gradient shimmer */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance text-white md:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
              {headline}
            </span>
          </motion.h2>

          {/* Excerpt */}
          {project.excerpt && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/70 text-pretty md:text-lg"
            >
              {project.excerpt}
            </motion.p>
          )}

          {/* Meta + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            {magneticOn ? <Magnetic>{CTA}</Magnetic> : CTA}

            {project.videoUrl && (
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("lumen:open-showreel"))
                }
                className="group inline-flex items-center gap-2.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 backdrop-blur-md transition-all group-hover:border-brand group-hover:bg-brand group-hover:text-black">
                  <Play className="h-3.5 w-3.5 translate-x-0.5 fill-current" />
                  <span className="absolute inset-0 rounded-full border border-white/30 animate-pulse-ring" />
                </span>
                Watch the film
              </button>
            )}

            {/* Meta strip — premium with brand separators */}
            <div className="hidden items-center gap-4 text-xs text-white/50 sm:flex">
              {project.year && (
                <span className="font-mono">{project.year}</span>
              )}
              {project.client && (
                <>
                  <span className="h-3 w-px bg-brand/40" />
                  <span>{project.client}</span>
                </>
              )}
              {project.location && (
                <>
                  <span className="h-3 w-px bg-brand/40" />
                  <span>{project.location}</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll-down indicator — subtle cue at the bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 md:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Scroll</span>
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-white/40" />
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Cinematic frame edges — thin brand accent lines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
    </section>
  );
}
