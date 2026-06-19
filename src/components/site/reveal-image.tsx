"use client";
import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Scroll-reveal wrapper with a clip-path wipe-in. The content is masked by
 * an `inset(0 100% 0 0)` clip that animates to `inset(0 0% 0 0)` when the
 * element enters the viewport — a cinematic "curtain wipe" reveal. Use
 * around image containers for a premium, film-grade entrance.
 *
 * Set `enabled={false}` to bypass the animation (admin feature-flag toggle)
 * and render children plainly without the clip-path.
 */
export function RevealImage({
  children,
  delay = 0,
  className,
  enabled = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  // When disabled, render children directly without the clip-path motion.
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
