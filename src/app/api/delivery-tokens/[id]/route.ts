import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** PATCH /api/delivery-tokens/[id] — revoke/unrevoke or update a token (admin). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.deliveryToken.findUnique({ where: { id } });
    if (!existing) return fail("Token not found", 404);
    const updated = await db.deliveryToken.update({
      where: { id },
      data: {
        ...(body.revoked !== undefined && { revoked: !!body.revoked }),
        ...(body.passphrase !== undefined && { passphrase: body.passphrase || null }),
        ...(body.expiresAt !== undefined && {
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        }),
      },
    });
    await logActivity({
      action: "update",
      entity: "project",
      label: "Delivery token",
      entityId: id,
      summary: body.revoked ? "Revoked delivery token" : "Updated delivery token",
      actor: guard.session?.user?.email ?? null,
    });
    return ok(updated);
  } catch (err) {
    return serverError("Failed to update token", err);
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
    const existing = await db.deliveryToken.findUnique({ where: { id } });
    if (!existing) return fail("Token not found", 404);
    await db.deliveryToken.delete({ where: { id } });
    await logActivity({
      action: "delete",
      entity: "project",
      label: "Delivery token",
      entityId: id,
      summary: "Deleted delivery token",
      actor: guard.session?.user?.email ?? null,
    });
    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete token", err);
  }
}
