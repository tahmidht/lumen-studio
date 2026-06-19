"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { CursorMode } from "@/lib/feature-flags";

/**
 * Custom cinematic cursor — a premium signature touch used by top agency
 * sites. Two layers: a small dot that tracks the pointer exactly, and a
 * larger ring that lags with spring physics. Both grow + invert on hover
 * over interactive elements. Disabled on touch devices and reduced-motion.
 *
 * `mode`:
 *  - "magnetic": full dot + ring (default premium experience)
 *  - "default": ring only (subtler, lighter)
 *  - "none": rendered by parent only when not "none"
 */
export function CustomCursor({ mode = "magnetic" }: { mode?: CursorMode }) {
  // lazy init: enable only on fine-pointer, non-reduced-motion devices
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !isTouch && !reduce;
  });
  const [variant, setVariant] = useState<"default" | "hover" | "press">("default");

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 350, damping: 28, mass: 0.5 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      const el = e.target as HTMLElement | null;
      const interactive = el?.closest(
        "a, button, [role='button'], input, textarea, select, [data-cursor='hover']"
      );
      setVariant(interactive ? "hover" : "default");
    };
    const down = () => setVariant((v) => (v === "hover" ? "hover" : "press"));
    const up = () => setVariant("default");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled, dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[150] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand mix-blend-difference md:block"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: variant === "hover" ? 1.8 : variant === "press" ? 0.7 : 1,
          opacity: variant === "hover" ? 1 : 0.6,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {/* Inner dot — only in full "magnetic" mode (subtler "default" = ring only) */}
      {mode === "magnetic" && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[150] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand mix-blend-difference md:block"
          style={{ x: dotX, y: dotY }}
          animate={{
            scale: variant === "hover" ? 0 : variant === "press" ? 1.5 : 1,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        />
      )}
    </>
  );
}
