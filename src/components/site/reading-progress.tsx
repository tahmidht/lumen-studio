"use client";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A thin brand-colored progress bar fixed to the top of the viewport that
 * fills as the reader scrolls through a long-form article. Render at the top
 * of an article page (z-indexed above the navbar).
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-brand"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
