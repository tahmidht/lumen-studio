import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const rows = await db.testimonial.findMany({
      orderBy: { order: "asc" },
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list testimonials", err);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.name || !body.content)
      return fail("Name and content are required");
    const created = await db.testimonial.create({
      data: {
        name: body.name,
        role: body.role || null,
        company: body.company || null,
        content: body.content,
        rating: Number(body.rating) || 5,
        avatar: body.avatar || null,
        order: Number(body.order) || 0,
        published: body.published !== false,
      },
    });
    await logActivity({
      action: "create",
      entity: "testimonial",
      label: created.name,
      entityId: created.id,
      summary: `Created testimonial “${created.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create testimonial", err);
  }
}
