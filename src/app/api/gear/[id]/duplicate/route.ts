import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";

/** POST /api/gear/[id]/duplicate — clone a gear item. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const original = await db.gear.findUnique({ where: { id } });
    if (!original) return fail("Gear not found", 404);

    const clone = await db.gear.create({
      data: {
        name: `${original.name} (Copy)`,
        category: original.category,
        brand: original.brand,
        description: original.description,
        image: original.image,
        order: original.order + 1,
      },
    });
    return ok(clone, 201);
  } catch (err) {
    return serverError("Failed to duplicate gear", err);
  }
}
