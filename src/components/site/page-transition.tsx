"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Subtle fade+rise transition between public route changes.
 * Wraps page content inside SiteShell.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
