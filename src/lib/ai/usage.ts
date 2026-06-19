/**
 * Usage tracker — records every AI call to the AiUsage table for analytics
 * + rate limiting. Never throws (failures are logged + swallowed so they
 * never break the AI response flow).
 */
import { db } from "@/lib/db";
import type { AiFeature } from "@/lib/ai/types";

export type UsageRecord = {
  feature: AiFeature;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  actor: string | null;
  success: boolean;
  error?: string;
};

/** Record a single AI call. Never throws. */
export async function recordUsage(record: UsageRecord): Promise<void> {
  try {
    await db.aiUsage.create({
      data: {
        feature: record.feature,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
        durationMs: record.durationMs,
        actor: record.actor ?? "anonymous",
        success: record.success,
        error: record.error ?? null,
      },
    });
  } catch (err) {
    console.error("[ai:usage] failed to record usage", err);
  }
}

/** Aggregate usage stats for the admin Settings → AI tab + dashboard widget. */
export type UsageStats = {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  last24h: number;
  byFeature: { feature: string; count: number; tokens: number }[];
  byDay: { date: string; count: number; tokens: number }[];
};

export async function getUsageStats(): Promise<UsageStats> {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, successCount, last24hCount, recent, byFeatureRaw] = await Promise.all([
    db.aiUsage.count(),
    db.aiUsage.count({ where: { success: true } }),
    db.aiUsage.count({ where: { createdAt: { gte: last24h } } }),
    db.aiUsage.findMany({
      where: { createdAt: { gte: last30d } },
      select: { feature: true, inputTokens: true, outputTokens: true, success: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.aiUsage.groupBy({
      by: ["feature"],
      _count: { _all: true },
      _sum: { inputTokens: true, outputTokens: true },
    }),
  ]);

  const byFeature = byFeatureRaw.map((f) => ({
    feature: f.feature,
    count: f._count._all,
    tokens: (f._sum.inputTokens ?? 0) + (f._sum.outputTokens ?? 0),
  }));

  // Group recent calls by day for the chart
  const byDayMap = new Map<string, { count: number; tokens: number }>();
  for (const r of recent) {
    const day = r.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
    const entry = byDayMap.get(day) ?? { count: 0, tokens: 0 };
    entry.count += 1;
    entry.tokens += r.inputTokens + r.outputTokens;
    byDayMap.set(day, entry);
  }
  const byDay = Array.from(byDayMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCalls: total,
    successCount,
    failureCount: total - successCount,
    totalInputTokens: byFeature.reduce((s, f) => s + 0, 0), // sum below
    totalOutputTokens: 0,
    last24h: last24hCount,
    byFeature,
    byDay,
  };
}
