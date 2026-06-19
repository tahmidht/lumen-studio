import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError, uniqueSlug, parseJsonArray } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const rows = await db.service.findMany({
      orderBy: { order: "asc" },
    });
    return ok(
      rows.map((s) => ({ ...s, features: parseJsonArray(s.features) }))
    );
  } catch (err) {
    return serverError("Failed to list services", err);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.title || !body.description)
      return fail("Title and description are required");
    const slug = await uniqueSlug(
      body.slug || body.title,
      (s) => db.service.findUnique({ where: { slug: s } }).then(Boolean)
    );
    const created = await db.service.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        icon: body.icon || null,
        features: JSON.stringify(Array.isArray(body.features) ? body.features : []),
        priceFrom: body.priceFrom || null,
        order: Number(body.order) || 0,
        published: body.published !== false,
      },
    });
    await logActivity({
      action: "create",
      entity: "service",
      label: created.title,
      entityId: created.id,
      summary: `Created service “${created.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create service", err);
  }
}
