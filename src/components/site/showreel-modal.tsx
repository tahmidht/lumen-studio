"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { VideoEmbed } from "@/components/site/video-embed";

/**
 * Fullscreen showreel modal. Opens on demand (triggered by a button
 * elsewhere), plays a video in a dramatic overlay with ambient backdrop,
 * custom close control, and Esc-to-close + body-scroll lock.
 *
 * Listens for the global `lumen:open-showreel` event (with a `url` detail)
 * so any component can trigger it without prop drilling.
 */
export function ShowreelModal() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail) {
        setUrl(ce.detail);
        setOpen(true);
      }
    };
    window.addEventListener("lumen:open-showreel", onOpen as EventListener);
    return () =>
      window.removeEventListener("lumen:open-showreel", onOpen as EventListener);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={close}
        >
          {/* ambient glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]" />

          {/* close button */}
          <button
            onClick={close}
            aria-label="Close showreel"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15"
          >
            <X className="h-5 w-5" />
          </button>

          {/* player */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/60">
              <VideoEmbed url={url} />
            </div>
            <p className="mt-4 text-center text-sm text-white/60">
              Showreel · press{" "}
              <kbd className="rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>{" "}
              to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
