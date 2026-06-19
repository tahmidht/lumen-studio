import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError, uniqueSlug } from "@/lib/api";

/** POST /api/services/[id]/duplicate — clone a service with a new slug. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const original = await db.service.findUnique({ where: { id } });
    if (!original) return fail("Service not found", 404);

    const slug = await uniqueSlug(
      `${original.slug}-copy`,
      (s) => db.service.findUnique({ where: { slug: s } }).then(Boolean)
    );

    const clone = await db.service.create({
      data: {
        title: `${original.title} (Copy)`,
        slug,
        description: original.description,
        icon: original.icon,
        features: original.features,
        priceFrom: original.priceFrom,
        order: original.order + 1,
        published: false,
      },
    });
    return ok(clone, 201);
  } catch (err) {
    return serverError("Failed to duplicate service", err);
  }
}
