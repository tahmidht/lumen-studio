import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail, buildTestimonialReplyPrompt, textPart, type TestimonialReplyInput } from "@/lib/ai";

/** POST /api/ai/testimonial-reply — draft a warm thank-you reply to a testimonial. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = (await req.json()) as TestimonialReplyInput;
    if (!body.testimonialContent || !body.name) {
      return fail("testimonialContent and name are required", 422);
    }

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "testimonial-reply",
      parts: textPart(buildTestimonialReplyPrompt(body)),
      maxOutputTokens: 200,
      temperature: 0.7,
      actor,
    });

    if (!result.ok) return fail(result.error, result.status);
    return ok({ text: result.data.text, usage: result.data.usage });
  } catch (err) {
    return serverError("AI testimonial reply failed", err);
  }
}
