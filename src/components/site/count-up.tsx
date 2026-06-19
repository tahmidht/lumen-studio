"use client";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

/**
 * Animated count-up number. Starts at 0 when scrolled into view and tweens
 * to the target value via a Framer Motion spring. Renders the rounded value
 * directly into the DOM via a ref (no React state churn). Parses numeric
 * portion of the string (e.g. "10+" → 10), preserves prefix/suffix.
 */
export function CountUp({
  value,
  duration = 1600,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(numRef, { once: true, margin: "-60px" });

  const match = /^([^\d]*)(\d+)(.*)$/.exec(value);
  const prefix = match?.[1] ?? "";
  const target = match?.[2] ? parseInt(match[2], 10) : 0;
  const suffix = match?.[3] ?? "";

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 20 });

  useEffect(() => {
    if (inView && match) {
      mv.set(target);
    }
  }, [inView, target, mv, match]);

  // write the rounded spring value directly to the DOM — no setState
  useMotionValueEvent(spring, "change", (v) => {
    if (numRef.current) {
      numRef.current.textContent = String(Math.round(v));
    }
  });

  if (!match) return <span className={className}>{value}</span>;

  return (
    <span className={className}>
      {prefix}
      <span ref={numRef}>0</span>
      {suffix}
    </span>
  );
}
