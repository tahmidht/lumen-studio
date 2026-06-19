"use client";
import { useEffect } from "react";

/**
 * Injects the admin-configurable brand accent color into CSS variables
 * at runtime so the entire design system stays in sync.
 */
export function BrandTheme({ accent }: { accent: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand", accent);
    root.style.setProperty("--brand-soft", hexToRgba(accent, 0.14));
  }, [accent]);

  return null;
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return `rgba(232, 181, 71, ${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
