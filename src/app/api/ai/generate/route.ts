import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail } from "@/lib/ai";
import { textPart } from "@/lib/ai/prompts";

/**
 * POST /api/ai/generate — generic text generation endpoint.
 *
 * Body: { prompt: string, maxOutputTokens?: number, temperature?: number, json?: boolean }
 *
 * Use this for ad-hoc generation. For specific features, prefer the dedicated
 * endpoints (/api/ai/project-desc, /api/ai/inquiry-reply, etc.) which use
 * typed prompt builders.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    if (!body.prompt || typeof body.prompt !== "string") {
      return fail("prompt is required", 422);
    }

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "custom",
      parts: textPart(body.prompt),
      maxOutputTokens: body.maxOutputTokens,
      temperature: body.temperature,
      json: body.json,
      actor,
    });

    if (!result.ok) {
      return fail(result.error, result.status);
    }

    return ok({
      text: result.data.text,
      json: result.data.json,
      usage: result.data.usage,
    });
  } catch (err) {
    return serverError("AI generate failed", err);
  }
}
