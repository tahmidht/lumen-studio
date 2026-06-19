import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { getSiteConfig } from "@/lib/settings";
import { sendInquiryNotification } from "@/lib/notify";

/** GET /api/inquiries — admin list */
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const status = req.nextUrl.searchParams.get("status");
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const rows = await db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return ok(rows);
  } catch (err) {
    return serverError("Failed to list inquiries", err);
  }
}

/** POST /api/inquiries — public submission */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.email || !body.message)
      return fail("Name, email and message are required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
      return fail("Invalid email address");

    // basic rate-limit-ish sanity
    const recent = await db.inquiry.count({
      where: {
        email: body.email.toLowerCase(),
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    });
    if (recent >= 3) return fail("Too many submissions, try again shortly", 429);

    const created = await db.inquiry.create({
      data: {
        name: String(body.name).slice(0, 120),
        email: String(body.email).toLowerCase().slice(0, 160),
        phone: body.phone ? String(body.phone).slice(0, 40) : null,
        projectType: body.projectType || null,
        budget: body.budget || null,
        eventDate: body.eventDate || null,
        message: String(body.message).slice(0, 4000),
        status: "NEW",
      },
    });
    await logActivity({
      action: "create",
      entity: "inquiry",
      label: `${created.name} <${created.email}>`,
      entityId: created.id,
      summary: `New inquiry from ${created.name} <${created.email}>`,
      actor: null,
    });

    // Fire-and-forget email notification (non-blocking, never throws).
    // Load the config + attempt the send in the background.
    (async () => {
      try {
        const config = await getSiteConfig();
        const result = await sendInquiryNotification({ inquiry: created, config });
        if (result.sent) {
          await logActivity({
            action: "config",
            entity: "inquiry",
            label: created.name,
            entityId: created.id,
            summary: `Email notification sent for inquiry from ${created.name}`,
            actor: null,
          });
        } else if (result.error && config.notifyInquiriesEnabled) {
          console.warn("[inquiry:notify] notification configured but failed:", result.error);
        }
      } catch (err) {
        console.error("[inquiry:notify] background send failed", err);
      }
    })();

    return ok(created, 201);
  } catch (err) {
    return serverError("Failed to submit inquiry", err);
  }
}
