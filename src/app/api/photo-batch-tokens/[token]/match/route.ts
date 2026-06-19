import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api";

/**
 * POST /api/photo-batches/[token]/match
 * Public endpoint — accepts a 128-dim face descriptor (extracted browser-side
 * from a selfie), compares it against all stored descriptors in the batch,
 * returns matching photo URLs sorted by match confidence.
 *
 * Body: { descriptor: number[], threshold?: number }
 *   descriptor — 128 floats from face-api (browser-side extraction)
 *   threshold  — euclidean distance threshold (default 0.6, lower = stricter)
 *
 * The selfie photo is NEVER uploaded — only the descriptor is sent.
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
      return fail("Photo link not found or revoked", 404);
    }
    if (tokenRow.expiresAt && tokenRow.expiresAt < new Date()) {
      return fail("This photo link has expired", 410);
    }

    // Passphrase check
    const body = await req.json();
    const passphrase = body.passphrase || "";
    if (tokenRow.passphrase && passphrase !== tokenRow.passphrase) {
      return fail("Passphrase required", 401);
    }

    const queryDescriptor = body.descriptor;
    if (!Array.isArray(queryDescriptor) || queryDescriptor.length !== 128) {
      return fail("Invalid descriptor (expected 128-dim array)", 422);
    }

    const threshold = typeof body.threshold === "number" ? body.threshold : 0.6;
    const batchId = tokenRow.batchId;

    // Fetch all face descriptors for this batch
    const faces = await db.photoFace.findMany({
      where: { batchId },
      select: { id: true, photoId: true, descriptor: true },
    });

    if (faces.length === 0) {
      return ok({ matches: [], totalFaces: 0, message: "No faces found in this batch." });
    }

    // Compare the query descriptor against all stored descriptors
    // Euclidean distance — lower = better match
    type Match = { photoId: string; distance: number };
    const photoBestMatch = new Map<string, number>(); // photoId → best (lowest) distance

    for (const face of faces) {
      const storedDesc = JSON.parse(face.descriptor) as number[];
      let dist = 0;
      for (let i = 0; i < 128; i++) {
        const diff = storedDesc[i] - queryDescriptor[i];
        dist += diff * diff;
      }
      dist = Math.sqrt(dist);

      if (dist <= threshold) {
        const existing = photoBestMatch.get(face.photoId);
        if (existing === undefined || dist < existing) {
          photoBestMatch.set(face.photoId, dist);
        }
      }
    }

    // Fetch the matching photos
    const matchEntries = Array.from(photoBestMatch.entries()).sort(
      (a, b) => a[1] - b[1] // sort by distance (best match first)
    ) as [string, number][];

    if (matchEntries.length === 0) {
      return ok({ matches: [], totalFaces: faces.length, message: "No matching photos found. Try a different photo or adjust the confidence." });
    }

    const photoIds = matchEntries.map((m) => m[0]);
    const photos = await db.photoBatchItem.findMany({
      where: { id: { in: photoIds } },
      select: { id: true, url: true, width: true, height: true },
    });

    // Map photos + their match confidence (convert distance to 0-100% score)
    const photoMap = new Map(photos.map((p) => [p.id, p]));
    const matches = matchEntries
      .map(([photoId, distance]) => {
        const photo = photoMap.get(photoId);
        if (!photo) return null;
        // Convert distance (0 = perfect, threshold = worst) to confidence (100% = best)
        const confidence = Math.round(((threshold - distance) / threshold) * 100);
        return {
          id: photo.id,
          url: photo.url,
          width: photo.width,
          height: photo.height,
          confidence: Math.max(0, Math.min(100, confidence)),
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    // Increment match count (fire-and-forget)
    db.photoBatchToken
      .update({
        where: { id: tokenRow.id },
        data: { matchCount: { increment: 1 } },
      })
      .catch(() => {});

    return ok({
      matches,
      totalFaces: faces.length,
      matchCount: matches.length,
    });
  } catch (err) {
    return serverError("Face match failed", err);
  }
}
