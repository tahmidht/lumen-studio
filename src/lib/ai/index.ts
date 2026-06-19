/**
 * AI orchestrator — the single entry point for all AI features.
 *
 * Wires together: config loading → rate-limit check → Gemini call → usage tracking.
 * Callers (API routes) use `runAi(request)` and get back an AiResult.
 *
 * This is the only file that touches the DB (for config + usage). The client
 * + prompts + rate-limit modules stay pure.
 */
import { getSiteConfig } from "@/lib/settings";
import { db } from "@/lib/db";
import { callGemini } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { recordUsage } from "@/lib/ai/usage";
import type { AiRequest, AiResult } from "@/lib/ai/types";

/** Env var override takes precedence over the DB-stored key. */
function resolveApiKey(dbKey: string | null | undefined): string {
  return process.env.GEMINI_API_KEY || dbKey || "";
}

/**
 * Run an AI request end-to-end:
 *   1. Load config (API key, model, system prompt)
 *   2. Check rate limit
 *   3. Call Gemini
 *   4. Record usage (success or failure)
 *   5. Return the result
 *
 * Never throws — always returns an AiResult.
 */
export async function runAi(request: AiRequest): Promise<AiResult> {
  // 1. Load config
  let config;
  try {
    config = await getSiteConfig();
  } catch (err) {
    return {
      ok: false,
      status: 500,
      error: `Failed to load site config: ${err instanceof Error ? err.message : "unknown"}`,
      feature: request.feature,
    };
  }

  if (!config.aiEnabled) {
    return {
      ok: false,
      status: 403,
      error: "AI features are disabled. Enable them in Settings → AI.",
      feature: request.feature,
    };
  }

  const apiKey = resolveApiKey(config.aiApiKey);
  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      error: "No Gemini API key configured. Add one in Settings → AI.",
      feature: request.feature,
    };
  }

  // 2. Rate limit
  const limit = await checkRateLimit(request.feature, request.actor);
  if (!limit.ok) {
    return {
      ok: false,
      status: 429,
      error:
        limit.reason === "minute"
          ? `Rate limit: ${limit.limit} calls per minute reached. Try again in ${limit.retryAfterSec}s.`
          : `Daily AI limit reached (${limit.limit} calls). Try again tomorrow.`,
      feature: request.feature,
    };
  }

  // 3. Call Gemini (use per-request systemPrompt or fall back to config override)
  const systemPrompt = request.systemPrompt || config.aiSystemPrompt || undefined;
  const result = await callGemini(apiKey, config.aiModel, {
    ...request,
    systemPrompt,
  });

  // 4. Record usage (fire-and-forget — never blocks the response)
  const actor = request.actor ?? "anonymous";
  if (result.ok) {
    void recordUsage({
      feature: request.feature,
      inputTokens: result.data.usage.inputTokens,
      outputTokens: result.data.usage.outputTokens,
      durationMs: result.data.durationMs,
      actor,
      success: true,
    });
  } else {
    void recordUsage({
      feature: request.feature,
      inputTokens: 0,
      outputTokens: 0,
      durationMs: 0,
      actor,
      success: false,
      error: result.error,
    });
  }

  return result;
}

/** Quick check: are AI features available right now? (for client-side UI gating) */
export async function isAiAvailable(): Promise<boolean> {
  try {
    const config = await getSiteConfig();
    return config.aiEnabled && (!!config.aiApiKey || !!process.env.GEMINI_API_KEY);
  } catch {
    return false;
  }
}

/**
 * Get the admin email from a NextAuth session for usage tracking.
 * Re-exported here so API routes have a single import.
 */
export async function getActorEmail(): Promise<string | null> {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as { email?: string } | undefined)?.email ?? null;
  } catch {
    return null;
  }
}

// Re-export the commonly used pieces so callers can import from one place
export { callGemini } from "@/lib/ai/client";
export { getUsageStats, type UsageStats } from "@/lib/ai/usage";
export { RATE_LIMITS } from "@/lib/ai/rate-limit";
export { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai/prompts/system";
export * from "@/lib/ai/prompts";
export * from "@/lib/ai/types";

// keep db referenced for tree-shaking safety
void db;
