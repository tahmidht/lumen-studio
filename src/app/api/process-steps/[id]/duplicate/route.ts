import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** POST /api/process-steps/[id]/duplicate — clone with "(Copy)" suffix, unpublished. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const original = await db.processStep.findUnique({ where: { id } });
    if (!original) return fail("Process step not found", 404);

    const clone = await db.processStep.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        image: original.image,
        imageAlt: original.imageAlt,
        phase: original.phase,
        order: original.order + 1,
        published: false,
      },
    });
    await logActivity({
      action: "duplicate",
      entity: "config",
      label: clone.title,
      entityId: clone.id,
      summary: `Duplicated process step “${original.title}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(clone, 201);
  } catch (err) {
    return serverError("Failed to duplicate process step", err);
  }
}
