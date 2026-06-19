import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** POST /api/faqs/[id]/duplicate — clone a FAQ with "(Copy)" suffix, unpublished. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const original = await db.faq.findUnique({ where: { id } });
    if (!original) return fail("FAQ not found", 404);

    const clone = await db.faq.create({
      data: {
        question: `${original.question} (Copy)`,
        answer: original.answer,
        category: original.category,
        order: original.order + 1,
        published: false,
      },
    });
    await logActivity({
      action: "duplicate",
      entity: "faq",
      label: clone.question,
      entityId: clone.id,
      summary: `Duplicated FAQ “${original.question}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(clone, 201);
  } catch (err) {
    return serverError("Failed to duplicate FAQ", err);
  }
}
