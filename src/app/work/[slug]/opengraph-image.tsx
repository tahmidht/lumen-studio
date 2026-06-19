import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { categoryLabel } from "@/lib/constants";

export const runtime = "nodejs";
export const alt = "LUMEN — Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG image for a single project — used for social sharing. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await db.project.findUnique({ where: { slug } });
  const title = project?.title ?? "LUMEN";
  const category = project ? categoryLabel(project.category) : "Film";
  const year = project?.year ?? "";
  const client = project?.client ?? "";

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
          padding: "72px",
          fontFamily: "sans-serif",
          color: "#f5f1ea",
          position: "relative",
        }}
      >
        {/* grain overlay via radial dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(232,181,71,0.18), transparent 55%)",
            display: "flex",
          }}
        />
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#E8B547",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              fontWeight: 700,
              color: "#E8B547",
              display: "flex",
            }}
          >
            LUMEN
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 20,
              color: "#9a948a",
              display: "flex",
            }}
          >
            {category.toUpperCase()}
            {year ? `  ·  ${year}` : ""}
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.02,
              maxWidth: 980,
              display: "flex",
            }}
          >
            {title}
          </div>
          {client ? (
            <div
              style={{
                fontSize: 28,
                color: "#bdb6ab",
                display: "flex",
              }}
            >
              {client}
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 22, color: "#9a948a", display: "flex" }}>
            Cinematography · Aerial · Color
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#E8B547",
              display: "flex",
            }}
          >
            lumen.studio
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
