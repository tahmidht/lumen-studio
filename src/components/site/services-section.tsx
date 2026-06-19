"use client";
import { motion } from "framer-motion";
import { Camera, Video, Palette, Plane, Clapperboard, Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Service } from "@/lib/types";
import { SectionHeader } from "@/components/site/featured-work";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera,
  Video,
  Palette,
  Plane,
  Clapperboard,
  Sparkles,
};

export function ServicesSection({ services }: { services: Service[] }) {
  if (!services.length) return null;
  return (
    <section id="services" className="relative border-b border-border bg-card/30 py-20 md:py-24">
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(60%_100%_at_50%_0%,var(--brand-glow,rgba(232,181,71,0.05))_0%,transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="What I Do"
          title="Full-spectrum cinematic craft"
          description="From the first storyboard to the final color grade — every stage handled with the same obsessive attention to detail."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = (s.icon && ICONS[s.icon]) || Clapperboard;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-7 transition-all hover:border-brand/40 hover:shadow-lg hover:shadow-black/20"
              >
                {/* Hover top accent line */}
                <div className="pointer-events-none absolute -inset-x-px -top-px h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* Hover ambient glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-brand/0 blur-3xl transition-all duration-500 group-hover:bg-brand/10" />

                <div className="relative flex items-start justify-between">
                  {/* Icon — always visible, smooth color transition */}
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand transition-all duration-300 group-hover:scale-110 group-hover:border-brand group-hover:bg-brand group-hover:text-black">
                    <Icon className="h-5 w-5" />
                  </span>
                  {s.priceFrom && (
                    <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                      from {s.priceFrom}
                    </span>
                  )}
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {s.description}
                </p>
                {s.features.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {s.features.slice(0, 4).map((f, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="h-1 w-1 rounded-full bg-brand" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {/* Enquire link — always visible, not just on hover */}
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand/70 transition-colors group-hover:text-brand"
                >
                  Enquire
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
