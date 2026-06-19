import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { randomBytes } from "crypto";

/** GET /api/delivery-tokens?projectId=... — list tokens for a project (admin). */
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) return fail("projectId is required", 422);
    const rows = await db.deliveryToken.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list delivery tokens", err);
  }
}

/** POST /api/delivery-tokens — create a new delivery token (admin). */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.projectId) return fail("projectId is required", 422);

    // Generate an opaque 32-char token (URL-safe)
    const token = randomBytes(16).toString("hex");

    const created = await db.deliveryToken.create({
      data: {
        projectId: body.projectId,
        token,
        passphrase: body.passphrase || null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    await logActivity({
      action: "create",
      entity: "project",
      label: "Delivery token",
      entityId: created.id,
      summary: `Created delivery token for project`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create delivery token", err);
  }
}
