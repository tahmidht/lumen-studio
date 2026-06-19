import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "LUMEN — Journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG image for a single journal post — used for social sharing. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  const title = post?.title ?? "LUMEN Journal";
  const author = post?.author ?? "LUMEN";
  const date = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

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
            "linear-gradient(135deg, #0c0a08 0%, #161210 50%, #0c0a08 100%)",
          padding: "72px",
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
              "radial-gradient(circle at 20% 80%, rgba(232,181,71,0.16), transparent 55%)",
            display: "flex",
          }}
        />
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
            JOURNAL
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 1000,
              display: "flex",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 26, color: "#bdb6ab", display: "flex" }}>
            {[author, date].filter(Boolean).join("  ·  ")}
          </div>
        </div>

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
            Behind the scenes
          </div>
          <div style={{ fontSize: 20, color: "#E8B547", display: "flex" }}>
            lumen.studio
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
