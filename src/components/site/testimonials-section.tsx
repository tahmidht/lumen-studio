"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { SectionHeader } from "@/components/site/featured-work";
import { cn } from "@/lib/utils";

export function TestimonialsSection({
  testimonials,
  autoplay = true,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) {
  const featured = testimonials.slice(0, Math.min(5, testimonials.length));
  const rest = testimonials.slice(5);
  const [active, setActive] = useState(0);

  const next = useCallback(
    () => setActive((a) => (a + 1) % Math.max(featured.length, 1)),
    [featured.length]
  );
  const prev = () =>
    setActive((a) => (a - 1 + Math.max(featured.length, 1)) % Math.max(featured.length, 1));

  // auto-advance — respects the autoplay prop (admin-toggleable via feature flag)
  useEffect(() => {
    if (!autoplay || featured.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, featured.length, autoplay]);

  if (!testimonials.length) return null;

  const current = featured[active];

  return (
    <section className="relative border-y border-border bg-card/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Kind Words"
          title="Trusted by creators & brands"
          description="A few words from the people who've trusted me with their stories."
        />

        {/* Featured carousel */}
        <div className="relative mt-14 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-background p-8 md:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-[100px]" />
          <Quote className="absolute right-8 top-8 h-20 w-20 text-brand/10" />

          <AnimatePresence mode="wait">
            <motion.figure
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={
                      idx < current.rating
                        ? "h-4 w-4 fill-brand text-brand"
                        : "h-4 w-4 text-muted-foreground/30"
                    }
                  />
                ))}
              </div>
              <blockquote className="mt-6 max-w-3xl font-display text-2xl font-medium leading-snug text-foreground text-balance md:text-4xl">
                “{current.content}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                {current.avatar ? (
                   
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 font-display text-base font-bold text-brand">
                    {current.name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-semibold">{current.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[current.role, current.company]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          {/* Controls */}
          {featured.length > 1 && (
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="ml-2 flex items-center gap-1.5">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === active
                        ? "w-6 bg-brand"
                        : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Supporting grid */}
        {rest.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((t, i) => (
              <motion.figure
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex flex-col rounded-2xl border border-border bg-background/40 p-7"
              >
                <Quote className="h-8 w-8 text-brand/30" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90 text-pretty">
                  “{t.content}”
                </blockquote>
                <div className="mt-5 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={
                        idx < t.rating
                          ? "h-3.5 w-3.5 fill-brand text-brand"
                          : "h-3.5 w-3.5 text-muted-foreground/30"
                      }
                    />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  {t.avatar ? (
                     
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand">
                      {t.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[t.role, t.company].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
