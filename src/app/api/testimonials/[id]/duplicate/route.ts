import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** POST /api/testimonials/[id]/duplicate — clone a testimonial with "(Copy)" suffix. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const original = await db.testimonial.findUnique({ where: { id } });
    if (!original) return fail("Testimonial not found", 404);

    const clone = await db.testimonial.create({
      data: {
        name: `${original.name} (Copy)`,
        role: original.role,
        company: original.company,
        content: original.content,
        rating: original.rating,
        avatar: original.avatar,
        order: original.order + 1,
        published: false,
      },
    });
    await logActivity({
      action: "duplicate",
      entity: "testimonial",
      label: clone.name,
      entityId: clone.id,
      summary: `Duplicated testimonial “${original.name}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(clone, 201);
  } catch (err) {
    return serverError("Failed to duplicate testimonial", err);
  }
}
