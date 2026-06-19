import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { runAi, getActorEmail, buildProjectDescPrompt, textPart, type ProjectDescInput } from "@/lib/ai";

/** POST /api/ai/project-desc — generate a cinematic project description. */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = (await req.json()) as ProjectDescInput;
    if (!body.title) return fail("title is required", 422);

    const actor = await getActorEmail();
    const result = await runAi({
      feature: "project-desc",
      parts: textPart(buildProjectDescPrompt(body)),
      maxOutputTokens: 600,
      temperature: 0.8,
      actor,
    });

    if (!result.ok) return fail(result.error, result.status);
    return ok({ text: result.data.text, usage: result.data.usage });
  } catch (err) {
    return serverError("AI project description failed", err);
  }
}
