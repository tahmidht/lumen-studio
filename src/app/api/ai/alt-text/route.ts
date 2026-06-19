import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail, buildAltTextPrompt, imagePart } from "@/lib/ai";

/**
 * POST /api/ai/alt-text — generate accessibility alt-text for an image (vision).
 *
 * Accepts either:
 *   { imageUrl: "https://..." }   — fetches the image server-side
 *   { imagePath: "/uploads/..." } — reads from the local filesystem
 *
 * Uses Gemini's vision capability (inline_data with base64 image).
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    const { imageUrl, imagePath } = body as { imageUrl?: string; imagePath?: string };
    if (!imageUrl && !imagePath) {
      return fail("imageUrl or imagePath is required", 422);
    }

    // Fetch the image as a buffer
    let buffer: Buffer;
    let mimeType = "image/jpeg";
    const src = imageUrl || imagePath!;

    if (src.startsWith("http://") || src.startsWith("https://")) {
      const imgRes = await fetch(src);
      if (!imgRes.ok) return fail(`Failed to fetch image (HTTP ${imgRes.status})`, 502);
      buffer = Buffer.from(await imgRes.arrayBuffer());
      mimeType = imgRes.headers.get("content-type") || "image/jpeg";
    } else if (src.startsWith("/")) {
      // Local file — read from disk
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "public", src);
      try {
        buffer = await fs.readFile(filePath);
        const ext = path.extname(src).toLowerCase();
        mimeType =
          ext === ".png" ? "image/png"
          : ext === ".webp" ? "image/webp"
          : ext === ".gif" ? "image/gif"
          : "image/jpeg";
      } catch {
        return fail(`Image not found: ${src}`, 404);
      }
    } else {
      return fail("imageUrl must start with http(s):// or /", 422);
    }

    // Gemini inline_data limit is ~20MB; bail if too big
    if (buffer.length > 20 * 1024 * 1024) {
      return fail("Image too large (max 20MB for vision)", 413);
    }

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "alt-text",
      parts: [imagePart(buffer, mimeType), { text: buildAltTextPrompt() }],
      maxOutputTokens: 100,
      temperature: 0.3,
      actor,
    });

    if (!result.ok) return fail(result.error, result.status);

    // Clean up the response (strip quotes, "Image of" prefixes)
    let altText = result.data.text.trim();
    altText = altText.replace(/^["']|["']$/g, ""); // strip wrapping quotes
    altText = altText.replace(/^(Image|Picture|Photo) of\s+/i, "");

    return ok({ altText, usage: result.data.usage });
  } catch (err) {
    return serverError("AI alt-text generation failed", err);
  }
}

// keep db referenced
void db;
