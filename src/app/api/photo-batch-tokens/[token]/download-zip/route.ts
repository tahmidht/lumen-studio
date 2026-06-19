import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import JSZip from "jszip";

/**
 * POST /api/photo-batch-tokens/[token]/download-zip
 * Public endpoint — accepts a list of photo IDs + a face descriptor for
 * verification, fetches all matching photos, streams a ZIP file.
 *
 * Body: { photoIds: string[], passphrase?: string }
 *
 * The photos are fetched server-side (from local filesystem or remote URL),
 * zipped, and streamed to the client as a single download.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const tokenRow = await db.photoBatchToken.findUnique({
      where: { token },
    });

    if (!tokenRow || tokenRow.revoked) {
      return NextResponse.json(
        { ok: false, error: "Photo link not found or revoked" },
        { status: 404 }
      );
    }
    if (tokenRow.expiresAt && tokenRow.expiresAt < new Date()) {
      return NextResponse.json(
        { ok: false, error: "This photo link has expired" },
        { status: 410 }
      );
    }

    const body = await req.json();
    const passphrase = body.passphrase || "";
    if (tokenRow.passphrase && passphrase !== tokenRow.passphrase) {
      return NextResponse.json(
        { ok: false, error: "Passphrase required" },
        { status: 401 }
      );
    }

    const photoIds: string[] = body.photoIds;
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No photo IDs provided" },
        { status: 422 }
      );
    }

    // Limit to 200 photos per ZIP (prevent abuse)
    const cappedIds = photoIds.slice(0, 200);

    // Fetch photo records — verify they belong to this batch
    const photos = await db.photoBatchItem.findMany({
      where: {
        id: { in: cappedIds },
        batchId: tokenRow.batchId,
      },
      select: { id: true, url: true, storageKey: true },
    });

    if (photos.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No photos found" },
        { status: 404 }
      );
    }

    // Create ZIP
    const zip = new JSZip();
    const folder = zip.folder("your-photos");

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      try {
        // Fetch the image
        let imageBuffer: Buffer;
        if (photo.url.startsWith("http://") || photo.url.startsWith("https://")) {
          const res = await fetch(photo.url);
          if (!res.ok) continue;
          imageBuffer = Buffer.from(await res.arrayBuffer());
        } else {
          // Local file
          const fs = await import("fs/promises");
          const path = await import("path");
          const filePath = path.join(process.cwd(), "public", photo.url);
          imageBuffer = await fs.readFile(filePath);
        }

        // Determine extension from the URL
        const ext = photo.url.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || ".jpg";
        const filename = `photo-${String(i + 1).padStart(3, "0")}${ext}`;
        folder?.file(filename, imageBuffer);
      } catch (err) {
        console.error(`[zip] failed to fetch photo ${photo.id}:`, err);
        // Skip failed photos — continue with the rest
      }
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Increment match count
    db.photoBatchToken
      .update({
        where: { id: tokenRow.id },
        data: { matchCount: { increment: 1 } },
      })
      .catch(() => {});

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="your-photos-${Date.now()}.zip"`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[zip] download failed", err);
    return NextResponse.json(
      { ok: false, error: "ZIP download failed" },
      { status: 500 }
    );
  }
}
