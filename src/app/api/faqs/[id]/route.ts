import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await db.faq.findUnique({ where: { id } });
    if (!row) return fail("FAQ not found", 404);
    return ok(row);
  } catch (err) {
    return serverError("Failed to get FAQ", err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.faq.findUnique({ where: { id } });
    if (!existing) return fail("FAQ not found", 404);
    const updated = await db.faq.update({
      where: { id },
      data: {
        ...(body.question !== undefined && { question: String(body.question).trim() }),
        ...(body.answer !== undefined && { answer: String(body.answer).trim() }),
        ...(body.category !== undefined && { category: String(body.category).trim() || "General" }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
        ...(body.published !== undefined && { published: !!body.published }),
      },
    });
    await logActivity({
      action: "update",
      entity: "faq",
      label: updated.question,
      entityId: updated.id,
      summary: `Updated FAQ “${updated.question}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update FAQ", err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const existing = await db.faq.findUnique({ where: { id } });
    if (!existing) return fail("FAQ not found", 404);
    await db.faq.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "faq",
      label: existing.question,
      entityId: id,
      summary: `Deleted FAQ “${existing.question}”`,
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete FAQ", err);
  }
}
