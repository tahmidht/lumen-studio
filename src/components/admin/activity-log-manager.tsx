"use client";
import { useEffect, useState, useCallback } from "react";
import {
  History,
  Loader2,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Star,
  StarOff,
  RefreshCw,
  Settings2,
  LogIn,
  ArrowUpDown,
  Mail,
  Eraser,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/lib/types";

type ActionMeta = {
  icon: typeof Plus;
  color: string; // tailwind classes for bg + text
};

const ACTION_META: Record<string, ActionMeta> = {
  create: { icon: Plus, color: "bg-emerald-500/15 text-emerald-400" },
  update: { icon: Pencil, color: "bg-sky-500/15 text-sky-400" },
  delete: { icon: Trash2, color: "bg-rose-500/15 text-rose-400" },
  publish: { icon: Eye, color: "bg-emerald-500/15 text-emerald-400" },
  unpublish: { icon: EyeOff, color: "bg-amber-500/15 text-amber-400" },
  duplicate: { icon: Copy, color: "bg-violet-500/15 text-violet-400" },
  feature: { icon: Star, color: "bg-brand/15 text-brand" },
  unfeature: { icon: StarOff, color: "bg-muted text-muted-foreground" },
  reorder: { icon: ArrowUpDown, color: "bg-slate-500/15 text-slate-400" },
  auth: { icon: LogIn, color: "bg-fuchsia-500/15 text-fuchsia-400" },
  config: { icon: Settings2, color: "bg-cyan-500/15 text-cyan-400" },
};

function metaFor(action: string): ActionMeta {
  return ACTION_META[action] ?? { icon: History, color: "bg-muted text-muted-foreground" };
}

function relativeTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityLogManager({ initial }: { initial: ActivityLog[] }) {
  const [rows, setRows] = useState<ActivityLog[]>(initial);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(initial.length >= 50);
  const [cursor, setCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/activity?limit=50");
      const json = await res.json();
      if (json.ok) {
        setRows(json.data.rows);
        setHasMore(Boolean(json.data.nextCursor));
        setCursor(json.data.nextCursor);
      }
    } catch {
      /* noop */
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const url = new URL("/api/activity", window.location.origin);
      url.searchParams.set("limit", "50");
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.ok) {
        setRows((prev) => [...prev, ...json.data.rows]);
        setHasMore(Boolean(json.data.nextCursor));
        setCursor(json.data.nextCursor);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading]);

  async function clearAll() {
    setClearing(true);
    try {
      const res = await fetch("/api/activity", { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Clear failed");
      toast.success(`Cleared ${json.data.deleted} entries`);
      setConfirmOpen(false);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Clear failed");
    } finally {
      setClearing(false);
    }
  }

  async function clearOlderThan(days: number) {
    setClearing(true);
    try {
      const res = await fetch(`/api/activity?olderThanDays=${days}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Clear failed");
      toast.success(`Removed ${json.data.deleted} entries older than ${days}d`);
      setConfirmOpen(false);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Clear failed");
    } finally {
      setClearing(false);
    }
  }

  // When the filter changes we still render from the local `rows` slice;
  // the server already returns everything newest-first.
  const visible = filter === "all" ? rows : rows.filter((r) => r.action === filter);

  // Auto-refresh once on mount so the feed feels live after navigation.
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (rows.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 border-dashed py-20 text-center">
        <History className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-display text-lg font-semibold">No activity yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Admin actions (create, update, delete, publish) will appear here as an
          audit trail.
        </p>
      </Card>
    );
  }

  const filters = ["all", "create", "update", "delete", "publish", "duplicate", "config", "auth"];

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors",
                filter === f
                  ? "border-brand bg-brand text-black"
                  : "border-border bg-card text-muted-foreground hover:border-brand/50 hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={clearing || rows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-rose-500/50 hover:text-rose-400 disabled:opacity-40"
            title="Clear activity log"
          >
            <Eraser className="h-3 w-3" />
            Clear log
          </button>
        </div>
      </div>

      {/* Clear-log confirm dialog */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => !clearing && setConfirmOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                  <Eraser className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">Clear activity log?</h3>
                  <p className="text-xs text-muted-foreground">
                    Choose how much history to remove. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                <button
                  onClick={() => clearOlderThan(90)}
                  disabled={clearing}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3 text-left text-sm transition-colors hover:border-brand/40 disabled:opacity-50"
                >
                  <span>Older than 90 days</span>
                  <span className="text-xs text-muted-foreground">Recommended</span>
                </button>
                <button
                  onClick={() => clearOlderThan(30)}
                  disabled={clearing}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3 text-left text-sm transition-colors hover:border-brand/40 disabled:opacity-50"
                >
                  <span>Older than 30 days</span>
                </button>
                <button
                  onClick={clearAll}
                  disabled={clearing}
                  className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-left text-sm text-rose-400 transition-colors hover:border-rose-500/60 hover:bg-rose-500/10 disabled:opacity-50"
                >
                  <span>Clear everything</span>
                  {clearing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                </button>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={clearing}
                  className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="relative space-y-2">
        {visible.map((row, idx) => {
          const meta = metaFor(row.action);
          const Icon = meta.icon;
          const isLast = idx === visible.length - 1;
          return (
            <div key={row.id} className="relative flex gap-4">
              {/* Timeline rail */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                    meta.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {!isLast && (
                  <span className="my-1 w-px flex-1 bg-border" aria-hidden />
                )}
              </div>

              {/* Card */}
              <Card
                className={cn(
                  "mb-1 flex-1 border-border bg-card p-3 transition-colors hover:border-brand/40",
                  idx === 0 && "border-brand/30 bg-brand/5"
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{row.summary}</span>
                  </p>
                  <time
                    className="shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground"
                    dateTime={new Date(row.createdAt).toISOString()}
                  >
                    {relativeTime(row.createdAt)}
                  </time>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono uppercase tracking-wider">
                    {row.action}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono uppercase tracking-wider">
                    {row.entity}
                  </span>
                  {row.actor && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {row.actor}
                    </span>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Load older
          </button>
        </div>
      )}
    </div>
  );
}
