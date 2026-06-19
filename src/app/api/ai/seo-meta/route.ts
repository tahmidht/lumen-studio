import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail, buildSeoMetaPrompt, textPart, type SeoMetaInput } from "@/lib/ai";

/** POST /api/ai/seo-meta — generate a 150-160 char SEO meta description. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = (await req.json()) as SeoMetaInput;
    if (!body.siteName) return fail("siteName is required", 422);

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "seo-meta",
      parts: textPart(buildSeoMetaPrompt(body)),
      maxOutputTokens: 80,
      temperature: 0.5,
      actor,
    });

    if (!result.ok) return fail(result.error, result.status);

    // Clean up — strip quotes, trailing punctuation padding
    let description = result.data.text.trim();
    description = description.replace(/^["']|["']$/g, "").trim();

    return ok({ description, charCount: description.length, usage: result.data.usage });
  } catch (err) {
    return serverError("AI SEO meta failed", err);
  }
}
