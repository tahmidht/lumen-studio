/**
 * Shared types for the AI subsystem.
 *
 * These types are used by the Gemini client, the prompt builders, the
 * rate-limiter, and the usage tracker. Keeping them in one place makes
 * the AI modules easy to reason about + refactor.
 */

/** The Gemini model to use. Defaults to gemini-2.5-flash (free tier). */
export type AiModel = string;

/** A single AI feature identifier — used for usage tracking + rate limiting. */
export type AiFeature =
  | "project-desc"
  | "inquiry-reply"
  | "social-posts"
  | "alt-text"
  | "blog-outline"
  | "delivery-email"
  | "seo-meta"
  | "testimonial-reply"
  | "custom";

/** Input to the Gemini client — text + optional inline image (for vision). */
export type AiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export type AiRequest = {
  /** The feature that triggered this call (for usage + rate limiting). */
  feature: AiFeature;
  /** User-visible prompt text. */
  parts: AiPart[];
  /** Max output tokens. Defaults to 500. */
  maxOutputTokens?: number;
  /** Temperature 0–2. Defaults to 0.7. */
  temperature?: number;
  /** When true, asks Gemini for JSON output (responseMimeType: application/json). */
  json?: boolean;
  /** Optional system-prompt override (falls back to SiteConfig.aiSystemPrompt). */
  systemPrompt?: string;
  /** Acting admin email (for usage tracking). */
  actor?: string | null;
};

export type AiResponse = {
  /** The generated text. */
  text: string;
  /** Parsed JSON when json:true was requested. */
  json?: unknown;
  /** Token usage from Gemini's usageMetadata. */
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  /** Round-trip duration in ms. */
  durationMs: number;
};

export type AiError = {
  ok: false;
  error: string;
  /** Status code to return to the client. */
  status: number;
  /** Feature that failed (for usage logging). */
  feature: AiFeature;
};

export type AiSuccess<T = AiResponse> = {
  ok: true;
  data: T;
};

export type AiResult<T = AiResponse> = AiSuccess<T> | AiError;
