import { ImageResponse } from "next/og";
import { getSiteConfig } from "@/lib/settings";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — larger brand mark on dark rounded square.
 * Matches the admin-configurable accent color.
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
          fontSize: 110,
          fontWeight: 800,
          color: accent,
          fontFamily: "sans-serif",
          letterSpacing: -2,
        }}
      >
        {letter}
      </div>
    ),
    { ...size }
  );
}
