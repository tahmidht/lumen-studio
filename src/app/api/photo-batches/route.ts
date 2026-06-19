import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** GET /api/photo-batches?projectId=... — list batches (admin). */
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    const where = projectId ? { projectId } : {};
    const rows = await db.photoBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    
    // Fetch associated tokens for these batches
    const batchIds = rows.map((r) => r.id);
    const tokens = await db.photoBatchToken.findMany({
      where: { batchId: { in: batchIds } },
    });

    const tokensMap = tokens.reduce((acc, t) => {
      if (!acc[t.batchId]) acc[t.batchId] = [];
      acc[t.batchId].push(t);
      return acc;
    }, {} as Record<string, typeof tokens>);

    const rowsWithTokens = rows.map((row) => ({
      ...row,
      tokens: tokensMap[row.id] || [],
    }));

    return ok(rowsWithTokens);
  } catch (err) {
    return serverError("Failed to list photo batches", err);
  }
}


/** POST /api/photo-batches — create a new batch (admin). */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.title) return fail("title is required", 422);
    const created = await db.photoBatch.create({
      data: {
        title: String(body.title).trim(),
        projectId: body.projectId || null,
        status: "READY",
      },
    });
    await logActivity({
      action: "create",
      entity: "project",
      label: created.title,
      entityId: created.id,
      summary: `Created photo batch “${created.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create photo batch", err);
  }
}
