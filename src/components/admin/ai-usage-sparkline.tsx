"use client";
import { useEffect, useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type DayData = { date: string; count: number; tokens: number };

/**
 * Mini 7-day AI usage sparkline — renders a small bar chart of the last 7
 * days' AI calls. Compact enough to sit in the dashboard sidebar.
 */
export function AiUsageSparkline() {
  const [days, setDays] = useState<DayData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/usage");
        const json = await res.json();
        if (!cancelled && json.ok) {
          // Take the last 7 days from byDay
          const last7 = json.data.byDay?.slice(-7) ?? [];
          // Fill in missing days with 0
          const filled = fillMissingDays(last7);
          setDays(filled);
          setTotal(filled.reduce((s, d) => s + d.count, 0));
        }
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
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-3 flex h-8 items-end gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 animate-pulse rounded-t-sm bg-muted" style={{ height: "40%" }} />
          ))}
        </div>
      </div>
    );
  }

  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI usage · 7 days
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          {total} call{total === 1 ? "" : "s"}
        </span>
      </div>
      <div className="mt-3 flex h-12 items-end gap-1.5">
        {days.map((d, i) => {
          const height = (d.count / max) * 100;
          const isToday = i === days.length - 1;
          return (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all duration-300",
                  d.count > 0
                    ? isToday
                      ? "bg-brand"
                      : "bg-brand/60"
                    : "bg-muted/50"
                )}
                style={{ height: `${Math.max(height, 4)}%`, minHeight: "2px" }}
              >
                {d.count > 0 && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    {d.count}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[9px] text-muted-foreground">
                {new Date(d.date).toLocaleDateString("en-US", { weekday: "narrow" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Fill in missing days in the last 7 days with 0 counts. */
function fillMissingDays(existing: DayData[]): DayData[] {
  const map = new Map(existing.map((d) => [d.date, d]));
  const result: DayData[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    result.push(map.get(key) ?? { date: key, count: 0, tokens: 0 });
  }
  return result;
}
