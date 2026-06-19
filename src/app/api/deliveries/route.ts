import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** GET /api/deliveries?projectId=... — list deliveries for a project (admin). */
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) return fail("projectId is required", 422);
    const rows = await db.projectDelivery.findMany({
      where: { projectId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list deliveries", err);
  }
}

/** POST /api/deliveries — create a new deliverable (admin). */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.projectId || !body.label) {
      return fail("projectId and label are required", 422);
    }
    const created = await db.projectDelivery.create({
      data: {
        projectId: body.projectId,
        type: body.type || "MAIN_FILM",
        label: String(body.label).trim(),
        url: body.url || null,
        status: body.status || "PENDING",
        clientEmail: body.clientEmail || null,
        notes: body.notes || null,
        order: Number(body.order) || 0,
      },
    });
    await logActivity({
      action: "create",
      entity: "project",
      label: created.label,
      entityId: created.id,
      summary: `Created deliverable “${created.label}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create delivery", err);
  }
}
