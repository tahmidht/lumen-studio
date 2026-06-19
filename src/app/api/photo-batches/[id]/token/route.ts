import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { randomBytes } from "crypto";

/** POST /api/photo-batches/[id]/token — create a shareable client link. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const batch = await db.photoBatch.findUnique({ where: { id } });
    if (!batch) return fail("Photo batch not found", 404);

    const token = randomBytes(16).toString("hex");
    const created = await db.photoBatchToken.create({
      data: {
        batchId: id,
        token,
      },
    });
    await logActivity({
      action: "create",
      entity: "project",
      label: "Photo batch token",
      entityId: created.id,
      summary: `Created photo batch link for “${batch.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create token", err);
  }
}

/** GET /api/photo-batches/[id]/token — list tokens/links for a batch. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const tokens = await db.photoBatchToken.findMany({
      where: { batchId: id },
      orderBy: { createdAt: "desc" },
    });
    return ok(tokens);
  } catch (err) {
    return serverError("Failed to fetch tokens", err);
  }
}

