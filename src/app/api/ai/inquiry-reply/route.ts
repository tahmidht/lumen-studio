import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail, buildInquiryReplyPrompt, textPart, type InquiryReplyInput } from "@/lib/ai";

/** POST /api/ai/inquiry-reply — draft a reply to a client inquiry. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = (await req.json()) as InquiryReplyInput;
    if (!body.inquiryName || !body.message) return fail("inquiryName and message are required", 422);

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "inquiry-reply",
      parts: textPart(buildInquiryReplyPrompt(body)),
      maxOutputTokens: 400,
      temperature: 0.7,
      actor,
    });

    if (!result.ok) return fail(result.error, result.status);
    return ok({ text: result.data.text, usage: result.data.usage });
  } catch (err) {
    return serverError("AI inquiry reply failed", err);
  }
}
