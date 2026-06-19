"use client";
import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type UsageStats = {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  last24h: number;
  byFeature: { feature: string; count: number; tokens: number }[];
  byDay: { date: string; count: number; tokens: number }[];
};

const FEATURE_LABELS: Record<string, string> = {
  "project-desc": "Project descriptions",
  "inquiry-reply": "Inquiry replies",
  "social-posts": "Social posts",
  "alt-text": "Image alt-text",
  "blog-outline": "Blog outlines",
  "delivery-email": "Delivery emails",
  "seo-meta": "SEO meta",
  "testimonial-reply": "Testimonial replies",
  custom: "Custom",
};

/**
 * AI usage panel — shows aggregate call counts + a 30-day sparkline.
 * Renders in the Settings → AI tab.
 */
export function AiUsagePanel() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/usage");
        const json = await res.json();
        if (!cancelled && json.ok) setStats(json.data);
      } catch {
        /* noop */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Loading usage…</p>
      </div>
    );
  }

  if (!stats || stats.totalCalls === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium">No AI calls yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Once you use an AI feature, usage stats will appear here.
        </p>
      </div>
    );
  }

  const maxDay = Math.max(...stats.byDay.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total calls" value={stats.totalCalls} icon={Zap} />
        <StatCard label="Last 24h" value={stats.last24h} icon={TrendingUp} />
        <StatCard label="Successes" value={stats.successCount} icon={Sparkles} accent="emerald" />
        <StatCard label="Failures" value={stats.failureCount} icon={AlertCircle} accent={stats.failureCount > 0 ? "rose" : "muted"} />
      </div>

      {/* 30-day chart */}
      {stats.byDay.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last 30 days
            </p>
            <p className="text-xs text-muted-foreground">{stats.byDay.length} active days</p>
          </div>
          <div className="flex h-20 items-end gap-1">
            {stats.byDay.map((d) => (
              <div
                key={d.date}
                className="group relative flex-1 rounded-t-sm bg-brand/60 transition-colors hover:bg-brand"
                style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: "2px" }}
                title={`${d.date}: ${d.count} calls`}
              />
            ))}
          </div>
        </div>
      )}

      {/* By feature */}
      {stats.byFeature.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            By feature
          </p>
          <div className="space-y-2">
            {stats.byFeature
              .sort((a, b) => b.count - a.count)
              .map((f) => (
                <div key={f.feature} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {FEATURE_LABELS[f.feature] || f.feature}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {f.tokens.toLocaleString()} tokens
                    </span>
                    <span className="w-8 text-right font-mono text-brand">{f.count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
}: {
  label: string;
  value: number;
  icon: typeof Zap;
  accent?: "brand" | "emerald" | "rose" | "muted";
}) {
  const colorMap = {
    brand: "text-brand",
    emerald: "text-emerald-500",
    rose: "text-rose-500",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <Icon className={cn("h-4 w-4", colorMap[accent])} />
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
