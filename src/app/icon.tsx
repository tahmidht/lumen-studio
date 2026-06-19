import { ImageResponse } from "next/og";
import { getSiteConfig } from "@/lib/settings";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Dynamic favicon that matches the admin-configurable accent color.
 * Renders a filled rounded square with a small "lens" dot — a miniature
 * version of the LUMEN brand mark.
 */
export default async function Icon() {
  const config = await getSiteConfig();
  const accent = config.accentColor || "#E8B547";
  const letter = (config.siteName || "L").charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a08",
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 800,
          color: accent,
          fontFamily: "sans-serif",
          letterSpacing: -1,
        }}
      >
        {letter}
      </div>
    ),
    { ...size }
  );
}
