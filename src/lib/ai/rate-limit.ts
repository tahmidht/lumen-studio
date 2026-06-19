/**
 * Rate limiter for AI calls — per-admin, per-minute + per-day limits.
 *
 * Uses the AiUsage table to count recent calls. Intentionally simple (no
 * in-memory cache) because:
 *   - SQLite is fast enough for this scale
 *   - A single-instance deploy doesn't need a distributed limiter
 *   - The limits are generous (free-tier Gemini is 15 RPM / 1,500/day)
 *
 * Limits are configurable here so they can be tuned without touching callers.
 */
import { db } from "@/lib/db";
import type { AiFeature } from "@/lib/ai/types";

/** Per-admin, per-minute limit. */
const RATE_LIMIT_PER_MINUTE = 12; // under Gemini's 15 RPM

/** Per-admin, per-day limit. */
const RATE_LIMIT_PER_DAY = 800; // under Gemini's 1,500/day

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: "minute" | "day"; limit: number; retryAfterSec: number };

/**
 * Check whether the given actor can make another AI call right now.
 * When `actor` is null/empty, uses a shared "anonymous" bucket.
 */
export async function checkRateLimit(
  feature: AiFeature,
  actor?: string | null
): Promise<RateLimitResult> {
  const bucket = actor || "anonymous";
  const now = Date.now();

  const oneMinuteAgo = new Date(now - 60_000);
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

  const [minuteCount, dayCount] = await Promise.all([
    db.aiUsage.count({
      where: { actor: bucket, createdAt: { gte: oneMinuteAgo } },
    }),
    db.aiUsage.count({
      where: { actor: bucket, createdAt: { gte: oneDayAgo } },
    }),
  ]);

  if (minuteCount >= RATE_LIMIT_PER_MINUTE) {
    return { ok: false, reason: "minute", limit: RATE_LIMIT_PER_MINUTE, retryAfterSec: 60 };
  }
  if (dayCount >= RATE_LIMIT_PER_DAY) {
    return { ok: false, reason: "day", limit: RATE_LIMIT_PER_DAY, retryAfterSec: 60 };
  }

  // feature is reserved for future per-feature limits
  void feature;
  return { ok: true };
}

export const RATE_LIMITS = {
  perMinute: RATE_LIMIT_PER_MINUTE,
  perDay: RATE_LIMIT_PER_DAY,
} as const;
