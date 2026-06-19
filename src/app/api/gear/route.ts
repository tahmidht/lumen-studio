import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const rows = await db.gear.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list gear", err);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.name) return fail("Name is required");
    const created = await db.gear.create({
      data: {
        name: body.name,
        category: body.category || "CAMERA",
        brand: body.brand || null,
        description: body.description || null,
        image: body.image || null,
        order: Number(body.order) || 0,
      },
    });
    await logActivity({
      action: "create",
      entity: "gear",
      label: created.name,
      entityId: created.id,
      summary: `Created gear “${created.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create gear", err);
  }
}
