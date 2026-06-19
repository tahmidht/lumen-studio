import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** GET /api/faqs — public: list published FAQs, ordered. Admin: list all. */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    const onlyPublished = admin.deny ? true : req.nextUrl.searchParams.get("all") !== "1";
    const rows = await db.faq.findMany({
      where: onlyPublished ? { published: true } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list FAQs", err);
  }
}

/** POST /api/faqs — admin: create a new FAQ. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.question || !body.answer) {
      return fail("question and answer are required", 422);
    }
    const created = await db.faq.create({
      data: {
        question: String(body.question).trim(),
        answer: String(body.answer).trim(),
        category: body.category ? String(body.category).trim() : "General",
        order: Number(body.order) || 0,
        published: body.published !== undefined ? !!body.published : true,
      },
    });
    await logActivity({
      action: "create",
      entity: "faq",
      label: created.question,
      entityId: created.id,
      summary: `Created FAQ “${created.question}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to create FAQ", err);
  }
}
