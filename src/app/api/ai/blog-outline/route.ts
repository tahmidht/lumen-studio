import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail, buildBlogOutlinePrompt, textPart, type BlogOutlineInput } from "@/lib/ai";

/** POST /api/ai/blog-outline — generate a blog post outline + first-section draft. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = (await req.json()) as BlogOutlineInput;
    if (!body.title) return fail("title is required", 422);

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "blog-outline",
      parts: textPart(buildBlogOutlinePrompt(body)),
      maxOutputTokens: 800,
      temperature: 0.7,
      actor,
    });

    if (!result.ok) return fail(result.error, result.status);
    return ok({ markdown: result.data.text, usage: result.data.usage });
  } catch (err) {
    return serverError("AI blog outline failed", err);
  }
}
