"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import type { Project } from "@/lib/types";
import { categoryLabel } from "@/lib/constants";
import { ProjectCard } from "@/components/site/project-card";

export function FeaturedWork({
  projects,
  revealEnabled = true,
}: {
  projects: Project[];
  revealEnabled?: boolean;
}) {
  if (!projects.length) return null;
  const [lead, ...rest] = projects;
  return (
    <section id="work" className="relative py-24 md:py-32">
      {/* Ambient background — subtle film grain + brand glow */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.03] mix-blend-overlay" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[60%] -translate-x-1/2 bg-[radial-gradient(50%_100%_at_50%_0%,var(--brand-glow,rgba(232,181,71,0.04))_0%,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Premium section header with counter + scroll indicator */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            {/* Animated eyebrow with film counter */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <span className="h-px w-10 bg-brand" />
              <span className="label-eyebrow text-brand">Selected Work</span>
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {String(projects.length).padStart(2, "0")} films
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-balance md:text-5xl"
            >
              Stories told frame by frame
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty"
            >
              A curated selection of recent films. Each project is an exploration
              of light, motion, and emotion.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-brand hover:text-brand hover:shadow-lg hover:shadow-brand/10"
            >
              View all projects
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Lead film — large cinematic frame with enhanced hover */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <Link href={`/work/${lead.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-brand/10">
              <div className="frame-cinema relative w-full overflow-hidden">
                {lead.thumbnail ? (
                  <img
                    src={lead.thumbnail}
                    alt={lead.thumbnailAlt || lead.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />

                {/* Premium hover sheen — sweeps across the image */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent transition-transform duration-[1.2s] ease-out group-hover:translate-x-full" />

                {/* Play indicator — animated pulse on hover */}
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                  <Play className="h-3 w-3 fill-brand text-brand" />
                  <span className="label-eyebrow text-white/80">
                    {categoryLabel(lead.category)}
                  </span>
                </div>

                {/* Hover-only: subtle brand corner accent */}
                <div className="pointer-events-none absolute right-5 top-5 h-8 w-8 rounded-full border border-brand/0 bg-brand/0 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:opacity-100" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="label-eyebrow text-brand">
                        {lead.client ?? "Featured"} · {lead.year ?? ""}
                      </p>
                      <h3 className="mt-3 font-display text-3xl font-bold leading-tight text-white md:text-5xl">
                        {lead.title}
                      </h3>
                      {lead.excerpt && (
                        <p className="mt-3 max-w-xl text-sm text-white/70 md:text-base">
                          {lead.excerpt}
                        </p>
                      )}
                    </div>
                    <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-black md:flex">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Supporting grid */}
        {rest.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 3).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <ProjectCard project={p} revealEnabled={revealEnabled} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-brand" />
          <span className="label-eyebrow text-brand">{eyebrow}</span>
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-balance md:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
