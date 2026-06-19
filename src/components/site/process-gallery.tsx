"use client";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/site/featured-work";
import { RevealImage } from "@/components/site/reveal-image";
import type { ProcessStep } from "@/lib/types";

/**
 * Behind-the-Scenes process gallery — admin-managed step-by-step storytelling.
 * Richer than the static ProcessSection: each step can have an optional BTS
 * photo, a phase label, and a long description.
 *
 * Layout: alternating left/right image-text rows on desktop (magazine-style),
 * stacked cards on mobile. Sticky phase indicator on the left rail.
 *
 * Falls back to null when no steps are published (caller should fall back
 * to the static ProcessSection).
 */
export function ProcessGallery({
  steps,
  revealEnabled = true,
}: {
  steps: ProcessStep[];
  revealEnabled?: boolean;
}) {
  if (!steps.length) return null;

  // Group by phase to render phase labels
  const phases = new Map<string, ProcessStep[]>();
  for (const s of steps) {
    const p = s.phase || "Process";
    if (!phases.has(p)) phases.set(p, []);
    phases.get(p)!.push(s);
  }

  return (
    <section id="process" className="relative border-t border-border py-24 md:py-32">
      {/* ambient brand glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,var(--brand-glow,rgba(232,181,71,0.06))_0%,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="The Process"
          title="How a film comes to life"
          description="A proven workflow — from the first conversation to the final grade. Every stage handled with the same obsessive attention to detail."
        />

        <div className="mt-16 space-y-16 md:space-y-24">
          {Array.from(phases.entries()).map(([phase, items], phaseIdx) => (
            <div key={phase} className="relative">
              {/* Phase label */}
              <div className="sticky top-20 z-10 mb-8 -mx-1 flex items-center gap-3 bg-background/80 px-1 py-2 backdrop-blur-sm">
                <span className="flex h-7 items-center rounded-full bg-brand/15 px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
                  Phase {String(phaseIdx + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {phase}
                </span>
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {items.length} step{items.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Steps in this phase */}
              <div className="space-y-10">
                {items.map((step, i) => {
                  const globalIdx = steps.findIndex((s) => s.id === step.id);
                  const flip = i % 2 === 1; // alternate layout
                  return (
                    <motion.article
                      key={step.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{
                        duration: 0.7,
                        delay: i * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="group grid items-center gap-6 md:gap-10 lg:grid-cols-2"
                    >
                      {/* Step number — always on the "outside" */}
                      <div
                        className={`flex items-start gap-5 ${
                          flip ? "lg:order-2" : ""
                        }`}
                      >
                        <span className="font-display text-5xl font-bold text-brand/20 transition-colors duration-300 group-hover:text-brand/40 md:text-6xl">
                          {String(globalIdx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-xl font-semibold leading-snug md:text-2xl">
                            {step.title}
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Image */}
                      {step.image && (
                        <div
                          className={`relative overflow-hidden rounded-2xl border border-border ${
                            flip ? "lg:order-1" : ""
                          }`}
                        >
                          <div className="aspect-[4/3] w-full">
                            <RevealImage
                              delay={i * 0.05}
                              className="h-full w-full"
                              enabled={revealEnabled}
                            >
                              <img
                                src={step.image}
                                alt={step.imageAlt || step.title}
                                className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                              />
                            </RevealImage>
                          </div>
                          {/* gradient scrim */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        </div>
                      )}
                    </motion.article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
