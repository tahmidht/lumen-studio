import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api";
import { getSiteConfig } from "@/lib/settings";

/**
 * GET /api/photo-batches/[token]?passphrase=...
 * Public endpoint — verifies token, returns batch info (no photos yet).
 * Photos are returned only after face-match (POST /api/photo-batches/[token]/match).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const row = await db.photoBatchToken.findUnique({
      where: { token },
    });

    if (!row || row.revoked) {
      return fail("Photo link not found or revoked", 404);
    }
    if (row.expiresAt && row.expiresAt < new Date()) {
      return fail("This photo link has expired", 410);
    }

    // Passphrase check
    const passphrase = req.nextUrl.searchParams.get("passphrase") || "";
    if (row.passphrase && passphrase !== row.passphrase) {
      return fail("Passphrase required", 401);
    }

    // Fetch batch separately (no explicit Prisma relation)
    const batch = await db.photoBatch.findUnique({
      where: { id: row.batchId },
      select: { id: true, title: true, photoCount: true, faceCount: true },
    });
    if (!batch) return fail("Batch not found", 404);

    // Increment view count (fire-and-forget)
    db.photoBatchToken
      .update({
        where: { id: row.id },
        data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
      })
      .catch(() => {});

    const config = await getSiteConfig();
    return ok({
      batch,
      siteName: config.siteName,
      requiresPassphrase: !!row.passphrase,
    });
  } catch (err) {
    return serverError("Failed to load photo batch", err);
  }
}
