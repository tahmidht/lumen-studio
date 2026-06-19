import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail, buildDeliveryEmailPrompt, textPart, type DeliveryEmailInput } from "@/lib/ai";
import { getSiteConfig } from "@/lib/settings";

/**
 * POST /api/deliveries/[id]/draft-email — generate an AI delivery email draft
 * for a specific deliverable. Saves the draft to the delivery row.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const delivery = await db.projectDelivery.findUnique({ where: { id } });
    if (!delivery) return fail("Delivery not found", 404);

    // Fetch the project separately (no explicit Prisma relation)
    const project = await db.project.findUnique({
      where: { id: delivery.projectId },
      select: { title: true, client: true },
    });
    if (!project) return fail("Project not found", 404);

    const config = await getSiteConfig();
    const input: DeliveryEmailInput = {
      projectTitle: project.title,
      clientName: project.client,
      clientEmail: delivery.clientEmail,
      deliverableLabel: delivery.label,
      deliverableType: delivery.type,
      deliveryUrl: delivery.url,
      siteName: config.siteName,
    };

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "delivery-email",
      parts: textPart(buildDeliveryEmailPrompt(input)),
      maxOutputTokens: 400,
      temperature: 0.7,
      actor,
    });

    if (!result.ok) return fail(result.error, result.status);

    // Save the draft to the delivery row
    await db.projectDelivery.update({
      where: { id },
      data: { aiEmailDraft: result.data.text },
    });

    return ok({ email: result.data.text, usage: result.data.usage });
  } catch (err) {
    return serverError("AI delivery email failed", err);
  }
}
