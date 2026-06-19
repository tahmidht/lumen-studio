import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** GET /api/subscribers — admin list */
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const rows = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list subscribers", err);
  }
}

/** POST /api/subscribers — public signup */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").toLowerCase().trim();
    if (!email) return fail("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return fail("Invalid email address");

    // rate-limit-ish sanity: max 3 signups per email per minute
    const recent = await db.subscriber.count({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    });
    if (recent >= 3) return fail("Too many submissions, try again shortly", 429);

    // upsert: if exists and inactive, reactivate; if new, create
    const existing = await db.subscriber.findUnique({ where: { email } });
    if (existing) {
      if (!existing.active) {
        await db.subscriber.update({
          where: { id: existing.id },
          data: { active: true },
        });
        await logActivity({
          action: "create",
          entity: "subscriber",
          label: existing.email,
          entityId: existing.id,
          summary: `Re-subscribed ${existing.email}`,
          actor: null,
        });
      }
      return ok({ id: existing.id, email, alreadySubscribed: true });
    }
    const created = await db.subscriber.create({ data: { email } });
    await logActivity({
      action: "create",
      entity: "subscriber",
      label: created.email,
      entityId: created.id,
      summary: `New subscriber ${created.email}`,
      actor: null,
    });
    return ok({ id: created.id, email, alreadySubscribed: false }, 201);
  } catch (err) {
    return serverError("Failed to subscribe", err);
  }
}
