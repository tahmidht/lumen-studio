import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** GET /api/process-steps — public: list published, ordered. Admin: list all. */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    const onlyPublished = admin.deny
      ? true
      : req.nextUrl.searchParams.get("all") !== "1";
    const rows = await db.processStep.findMany({
      where: onlyPublished ? { published: true } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list process steps", err);
  }
}

/** POST /api/process-steps — admin: create. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.title || !body.description) {
      return fail("title and description are required", 422);
    }
    const created = await db.processStep.create({
      data: {
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        image: body.image || null,
        imageAlt: body.imageAlt || null,
        phase: body.phase ? String(body.phase).trim() : null,
        order: Number(body.order) || 0,
        published: body.published !== undefined ? !!body.published : true,
      },
    });
    await logActivity({
      action: "create",
      entity: "config",
      label: created.title,
      entityId: created.id,
      summary: `Created process step “${created.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create process step", err);
  }
}
