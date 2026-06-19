"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import type { SiteConfig } from "@/lib/types";

export function ContactCTA({ config }: { config: SiteConfig }) {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-border py-28 md:py-40"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]" />
      </div>
      <div className="absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />

      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Let's Create</span>
            <span className="h-px w-10 bg-brand" />
          </div>
          <h2 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
            Got a story
            <br />
            worth telling?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Tell me about your project. I'll bring the cameras, the crew, and the
            obsession with light.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-semibold text-black transition-all hover:brightness-110"
            >
              Start a Project
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href={`mailto:${config.contactEmail}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-8 py-4 text-sm font-medium backdrop-blur-sm transition-all hover:border-brand hover:text-brand"
            >
              <Mail className="h-4 w-4" />
              {config.contactEmail}
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {config.contactPhone && (
              <span className="inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand" />
                {config.contactPhone}
              </span>
            )}
            {config.contactLocation && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                {config.contactLocation}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
