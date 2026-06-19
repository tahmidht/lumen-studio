import { ImageResponse } from "next/og";
import { getSiteConfig } from "@/lib/settings";

export const runtime = "nodejs";
export const alt = "LUMEN — Cinematography & Visual Storytelling";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default site OG image for the homepage + non-dynamic routes. */
export default async function Image() {
  const config = await getSiteConfig();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0c0a08 0%, #1a1410 50%, #0c0a08 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
          color: "#f5f1ea",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 40%, rgba(232,181,71,0.20), transparent 60%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: "#E8B547",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 10,
              fontWeight: 700,
              color: "#E8B547",
              display: "flex",
            }}
          >
            {config.siteName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.0,
              maxWidth: 1000,
              display: "flex",
            }}
          >
            {config.heroTitle}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#bdb6ab",
              maxWidth: 820,
              display: "flex",
            }}
          >
            {config.siteTagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 30,
          }}
        >
          <div style={{ fontSize: 24, color: "#9a948a", display: "flex" }}>
            Cinematography · Aerial · Color
          </div>
          <div style={{ fontSize: 22, color: "#E8B547", display: "flex" }}>
            {config.contactLocation?.split(" · ")[0] ?? "Available Worldwide"}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
