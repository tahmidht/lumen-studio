import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api";
import { getSiteConfig } from "@/lib/settings";

/**
 * GET /api/delivery-tokens/[token]?passphrase=... — public endpoint.
 *
 * Verifies a delivery token + optional passphrase, returns the project +
 * its deliverables (only those with a URL + status SENT/DELIVERED).
 *
 * Also increments the view count + updates lastViewedAt.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const row = await db.deliveryToken.findUnique({
      where: { token },
    });

    if (!row || row.revoked) {
      return fail("Delivery link not found or revoked", 404);
    }
    if (row.expiresAt && row.expiresAt < new Date()) {
      return fail("This delivery link has expired", 410);
    }

    // Passphrase check
    const passphrase = req.nextUrl.searchParams.get("passphrase") || "";
    if (row.passphrase && passphrase !== row.passphrase) {
      // Don't reveal which token — just 401
      return fail("Passphrase required", 401);
    }

    // Fetch the project separately (no explicit Prisma relation)
    const project = await db.project.findUnique({
      where: { id: row.projectId },
      select: {
        id: true,
        title: true,
        client: true,
        excerpt: true,
        thumbnail: true,
        posterImage: true,
      },
    });
    if (!project) return fail("Project not found", 404);

    // Fetch deliverables (only SENT + DELIVERED, must have a URL)
    const deliveries = await db.projectDelivery.findMany({
      where: {
        projectId: row.projectId,
        status: { in: ["SENT", "DELIVERED"] },
        url: { not: null },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        type: true,
        label: true,
        url: true,
        notes: true,
      },
    });

    // Increment view count + last viewed (fire-and-forget)
    db.deliveryToken
      .update({
        where: { id: row.id },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
        },
      })
      .catch(() => {});

    const config = await getSiteConfig();
    return ok({
      project,
      deliveries,
      siteName: config.siteName,
      siteContact: config.contactEmail,
    });
  } catch (err) {
    return serverError("Failed to load delivery", err);
  }
}
