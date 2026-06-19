import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail, buildSocialPostsPrompt, textPart, type SocialPostsInput } from "@/lib/ai";

/** POST /api/ai/social-posts — generate 3 social media posts (IG, LinkedIn, Twitter). */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = (await req.json()) as SocialPostsInput;
    if (!body.title) return fail("title is required", 422);

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "social-posts",
      parts: textPart(buildSocialPostsPrompt(body)),
      maxOutputTokens: 600,
      temperature: 0.8,
      json: true,
      actor,
    });

    if (!result.ok) return fail(result.error, result.status);

    // Validate the JSON shape
    const parsed = result.data.json as { instagram?: string; linkedin?: string; twitter?: string } | undefined;
    if (!parsed?.instagram || !parsed?.linkedin || !parsed?.twitter) {
      // Fallback: return raw text if JSON parsing failed
      return ok({ text: result.data.text, usage: result.data.usage, posts: null });
    }

    return ok({
      posts: {
        instagram: parsed.instagram,
        linkedin: parsed.linkedin,
        twitter: parsed.twitter,
      },
      usage: result.data.usage,
    });
  } catch (err) {
    return serverError("AI social posts failed", err);
  }
}
