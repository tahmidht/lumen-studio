"use client";
import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Magnetic wrapper — children subtly follow the cursor when hovered, then
 * spring back on leave. Use on premium CTAs (buttons, links) for a tactile,
 * high-end feel. Disabled on touch devices via CSS (only active on md+).
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  }

  function onLeave() {
    setPos({ x: 0, y: 0 });
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
