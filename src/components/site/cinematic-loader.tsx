"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Cinematic first-load loader.
 * Plays once per session (sessionStorage-guarded): a brief aperture-like
 * reveal — two dark panels slide apart to unveil the site, with the brand
 * mark pulsing at center. Sets the cinematic tone on entry.
 */
export function CinematicLoader({ siteName }: { siteName: string }) {
  // lazy init from sessionStorage — if already loaded this session, skip
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("lumen-loaded") !== "1";
  });

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("lumen-loaded", "1");
    }, 2400);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Two panels that slide apart */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-black"
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-black"
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Brand mark */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="relative flex h-16 w-16 items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, ease: "linear" }}
            >
              <span className="absolute inset-0 rounded-full border border-brand/30" />
              <span className="absolute inset-2 rounded-full border border-brand/50" />
              <motion.span
                className="h-2.5 w-2.5 rounded-full bg-brand"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <motion.span
              className="font-display text-sm font-bold tracking-[0.3em] text-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {siteName}
            </motion.span>
            {/* progress bar */}
            <motion.div
              className="h-px w-24 overflow-hidden bg-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="h-full bg-brand"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
