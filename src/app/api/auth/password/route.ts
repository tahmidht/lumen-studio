import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/password";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** POST /api/auth/password — change the current user's password (auth required) */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return fail("Unauthorized", 401);
  }
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body ?? {};
    if (!currentPassword || !newPassword) {
      return fail("Current and new passwords are required");
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return fail("New password must be at least 8 characters");
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return fail("User not found", 404);

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return fail("Current password is incorrect", 403);
    }

    const passwordHash = hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false },
    });
    await logActivity({
      action: "auth",
      entity: "auth",
      label: user.email,
      entityId: user.id,
      summary: `Changed account password`,
      actor: user.email,
    });

    return ok({ ok: true, clearedFlag: user.mustChangePassword });
  } catch (err) {
    return serverError("Failed to change password", err);
  }
}
