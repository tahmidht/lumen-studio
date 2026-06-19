"use client";
import { motion } from "framer-motion";
import type { SiteConfig } from "@/lib/types";
import { SectionHeader } from "@/components/site/featured-work";
import { CountUp } from "@/components/site/count-up";
import { RevealImage } from "@/components/site/reveal-image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function AboutSection({ config }: { config: SiteConfig }) {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
              <div className="frame-cinema relative w-full">
                {config.aboutImage ? (
                  <RevealImage
                    className="absolute inset-0 h-full w-full"
                    enabled={config.featureFlags?.imageReveal ?? true}
                  >
                    <img
                      src={config.aboutImage}
                      alt="Cinematographer portrait"
                      className="h-full w-full object-cover"
                    />
                  </RevealImage>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <SectionHeader
              eyebrow="Behind the Lens"
              title="A decade chasing light"
            />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
              {config.aboutBio}
            </p>

            {/* Stats */}
            {config.aboutStats.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
                {config.aboutStats.map((s) => (
                  <div key={s.label} className="bg-card p-5">
                    <p className="font-display text-3xl font-bold text-brand">
                      <CountUp value={s.value} />
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {config.aboutSkills.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {config.aboutSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <Link
              href="/about"
              className="group mt-10 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-all hover:border-brand hover:text-brand"
            >
              Read the full story
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
