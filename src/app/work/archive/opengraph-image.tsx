import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";

export const runtime = "nodejs";
export const alt = "LUMEN — Project Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG image for the /work/archive index page. */
export default async function Image() {
  const [config, count, projects] = await Promise.all([
    getSiteConfig(),
    db.project.count({ where: { published: true } }),
    db.project.findMany({
      where: { published: true, year: { not: null } },
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    }),
  ]);
  const years = projects.map((p) => p.year).filter(Boolean) as number[];
  const yearRange =
    years.length > 0
      ? `${Math.min(...years)}–${Math.max(...years)}`
      : "Archive";

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
              "radial-gradient(circle at 70% 40%, rgba(232,181,71,0.18), transparent 60%)",
            display: "flex",
          }}
        />
        {/* Brand */}
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

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#E8B547",
              display: "flex",
            }}
          >
            Portfolio
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.0,
              display: "flex",
            }}
          >
            The Archive
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#bdb6ab",
              maxWidth: 820,
              display: "flex",
            }}
          >
            {count} film{count === 1 ? "" : "s"} · {yearRange} · every project,
            grouped by year.
          </div>
        </div>

        {/* Footer */}
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
            {config.siteName} · Selected Work
          </div>
          <div style={{ fontSize: 22, color: "#E8B547", display: "flex" }}>
            /work/archive
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
