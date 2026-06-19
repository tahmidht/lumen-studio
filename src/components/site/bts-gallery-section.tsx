"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { BtsPhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Behind-the-Scenes gallery — a richer gallery section for project detail pages.
 * Each photo can have an optional caption. Renders a masonry-ish grid; clicking
 * a photo opens a lightbox with prev/next nav (keyboard + buttons).
 */
export function BtsGallerySection({
  photos,
  projectTitle,
}: {
  photos: BtsPhoto[];
  projectTitle: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const open = lightbox !== null;
  const current = open ? photos[lightbox] : null;
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setLightbox((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );
  const close = useCallback(() => setLightbox(null), []);

  // Keyboard navigation: ← prev, → next, Esc close. Only when lightbox is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while the lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, prev, next, close]);

  if (!photos.length) return null;

  return (
    <section className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand" />
              <span className="label-eyebrow text-brand">On set</span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">
              Behind the scenes
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground text-pretty">
              How “{projectTitle}” came together — setup, gear, and the moments
              between the takes.
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Camera className="h-3.5 w-3.5 text-brand" />
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Grid — alternating sizes for visual rhythm */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, i) => {
            // Make every 5th photo span 2 columns for a magazine feel
            const wide = i % 5 === 2;
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => setLightbox(i)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(i * 0.04, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-brand/40",
                  wide && "sm:col-span-2"
                )}
              >
                <div className={cn("relative w-full", wide ? "aspect-[16/9]" : "aspect-[4/3]")}>
                  <img
                    src={photo.image}
                    alt={photo.alt || `${projectTitle} — behind the scenes ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
                </div>
                {photo.caption && (
                  <p className="absolute bottom-0 left-0 right-0 p-4 text-sm text-white/90 text-pretty">
                    {photo.caption}
                  </p>
                )}
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                  <Camera className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[85vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={current.image}
                alt={current.alt || `${projectTitle} — behind the scenes`}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
              {current.caption && (
                <p className="mt-4 text-center text-sm text-white/80 text-pretty">
                  {current.caption}
                </p>
              )}
              <p className="mt-2 text-center text-xs text-white/40">
                {lightbox! + 1} / {photos.length}
                <span className="ml-3 hidden sm:inline">
                  ← → navigate · Esc close
                </span>
              </p>
            </motion.div>

            {/* Next */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
