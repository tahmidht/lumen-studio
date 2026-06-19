"use client";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Accessible image lightbox for the project detail gallery.
 * Opens on click, supports ←/→/Esc keyboard nav + click-outside to close.
 */
export function GalleryLightbox({ images }: { images: string[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () =>
      setIndex((i) =>
        i === null ? i : (i - 1 + images.length) % images.length
      ),
    [images.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    // lock body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, next, prev]);

  if (!images.length) return null;

  return (
    <>
      {/* Thumbnails */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`group relative overflow-hidden rounded-xl border border-border transition-all hover:border-brand/50 ${
              i % 3 === 0 ? "sm:col-span-2" : ""
            }`}
            aria-label={`Open image ${i + 1} in lightbox`}
          >
            { }
            <img
              src={url}
              alt={`Gallery image ${i + 1}`}
              className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
              View
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {index !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={close}
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15 md:left-8"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              { }
              <img
                src={images[index]}
                alt={`Gallery image ${index + 1}`}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
            </motion.div>

            {/* Next */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15 md:right-8"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/50 px-4 py-1.5 text-xs text-white/80 backdrop-blur-md">
                {index + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
