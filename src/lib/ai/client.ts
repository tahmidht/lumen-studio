/**
 * Gemini API client — thin fetch wrapper around Google's Generative Language API.
 *
 * Responsibilities:
 *   - Build the request body from AiRequest
 *   - Call the Gemini endpoint with the API key
 *   - Parse the response (text + JSON mode + usage metadata)
 *   - Handle errors (network, auth, rate-limit, safety)
 *   - Return a typed AiResult
 *
 * Does NOT:
 *   - Read the API key from the DB (the caller passes it in)
 *   - Track usage (the caller does that via usage.ts)
 *   - Rate-limit (the caller does that via rate-limit.ts)
 *
 * This separation keeps the client pure + testable.
 */
import type { AiRequest, AiResponse, AiResult, AiPart } from "@/lib/ai/types";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai/prompts/system";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

/** Build the Gemini API URL for a given model. */
function endpointFor(model: string): string {
  return `${GEMINI_ENDPOINT}/${model}:generateContent`;
}

type GeminiPart = {
  text?: string;
  inline_data?: { mime_type: string; data: string };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
    safetyRatings?: unknown;
  }>;
  promptFeedback?: {
    blockReason?: string;
    blockReasonMessage?: string;
  };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: { code?: number; message?: string; status?: string };
};

/** Convert our AiPart type to Gemini's snake_case format. */
function toGeminiPart(part: AiPart): GeminiPart {
  if ("text" in part) return { text: part.text };
  return {
    inline_data: {
      mime_type: part.inlineData.mimeType,
      data: part.inlineData.data,
    },
  };
}

/**
 * Call the Gemini API. Returns a typed AiResult.
 *
 * @param apiKey  The Gemini API key (from SiteConfig.aiApiKey or GEMINI_API_KEY env var).
 * @param model   The model name, e.g. "gemini-2.5-flash".
 * @param request The AiRequest (feature, parts, options, actor).
 */
export async function callGemini(
  apiKey: string,
  model: string,
  request: AiRequest
): Promise<AiResult> {
  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      error: "No Gemini API key configured. Add one in Settings → AI.",
      feature: request.feature,
    };
  }

  const start = Date.now();
  const systemPrompt = request.systemPrompt || DEFAULT_SYSTEM_PROMPT;

  const body = {
    contents: [
      {
        role: "user",
        parts: request.parts.map(toGeminiPart),
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxOutputTokens ?? 500,
      ...(request.json ? { responseMimeType: "application/json" } : {}),
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  let res: Response;
  try {
    res = await fetch(`${endpointFor(model)}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: `Network error calling Gemini: ${err instanceof Error ? err.message : "fetch failed"}`,
      feature: request.feature,
    };
  }

  let json: GeminiResponse;
  try {
    json = (await res.json()) as GeminiResponse;
  } catch {
    return {
      ok: false,
      status: 502,
      error: `Gemini returned non-JSON response (HTTP ${res.status})`,
      feature: request.feature,
    };
  }

  // Gemini error shape
  if (json.error) {
    const status =
      json.error.status === "RESOURCE_EXHAUSTED"
        ? 429
        : json.error.code === 400
        ? 400
        : json.error.code === 403
        ? 401
        : 502;
    return {
      ok: false,
      status,
      error: json.error.message || "Gemini API error",
      feature: request.feature,
    };
  }

  // Prompt blocked by safety filters
  if (json.promptFeedback?.blockReason) {
    return {
      ok: false,
      status: 400,
      error: `Prompt blocked by Gemini safety filter: ${json.promptFeedback.blockReasonMessage || json.promptFeedback.blockReason}`,
      feature: request.feature,
    };
  }

  // No candidates
  const candidate = json.candidates?.[0];
  if (!candidate) {
    return {
      ok: false,
      status: 502,
      error: "Gemini returned no candidates",
      feature: request.feature,
    };
  }

  const text = candidate.content?.parts?.map((p) => p.text || "").join("") ?? "";
  if (!text.trim()) {
    return {
      ok: false,
      status: 502,
      error: `Gemini returned empty text (finishReason: ${candidate.finishReason ?? "unknown"})`,
      feature: request.feature,
    };
  }

  const inputTokens = json.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = json.usageMetadata?.candidatesTokenCount ?? 0;
  const durationMs = Date.now() - start;

  const response: AiResponse = {
    text,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: json.usageMetadata?.totalTokenCount ?? inputTokens + outputTokens,
    },
    durationMs,
  };

  // Parse JSON when requested
  if (request.json) {
    try {
      response.json = JSON.parse(text);
    } catch {
      // If JSON parsing fails, still return the text — the caller can decide
    }
  }

  return { ok: true, data: response };
}
