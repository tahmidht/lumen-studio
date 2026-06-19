"use client";
import { useState, useEffect } from "react";
import { Download, Lock, Loader2, Film, FileVideo, Image as ImageIcon, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Delivery = {
  id: string;
  type: string;
  label: string;
  url: string | null;
  notes: string | null;
};

type DeliveryResponse = {
  project: {
    id: string;
    title: string;
    client: string | null;
    excerpt: string | null;
    thumbnail: string | null;
    posterImage: string | null;
  };
  deliveries: Delivery[];
  siteName: string;
  siteContact: string;
};

const TYPE_ICONS: Record<string, typeof Film> = {
  MAIN_FILM: Film,
  SOCIAL_CUT: FileVideo,
  RAW_FOOTAGE: Download,
  COLOR_MASTER: Film,
  TRAILER: Film,
  CUSTOM: Download,
};

/**
 * Client-side delivery viewer — fetches the deliveries via the public API,
 * handles the passphrase gate if required.
 */
export function DeliveryClient({
  token,
  requiresPassphrase,
}: {
  token: string;
  requiresPassphrase: boolean;
}) {
  const [passphrase, setPassphrase] = useState("");
  const [authed, setAuthed] = useState(!requiresPassphrase);
  const [data, setData] = useState<DeliveryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(pass?: string) {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`/api/delivery/${token}`, window.location.origin);
      if (pass) url.searchParams.set("passphrase", pass);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (!json.ok) {
        if (res.status === 401) {
          setError("Wrong passphrase. Try again.");
          setAuthed(false);
        } else {
          setError(json.error || "Failed to load");
        }
        return;
      }
      setData(json.data);
      setAuthed(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  // Auto-load when no passphrase needed
  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  // Passphrase gate
  if (!authed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-sm"
      >
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-brand" />
          <h2 className="mt-4 font-display text-xl font-semibold">Passphrase required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the passphrase from your delivery email to view your films.
          </p>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(passphrase)}
            placeholder="Passphrase"
            className="mt-5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
          />
          <button
            onClick={() => load(passphrase)}
            disabled={loading || !passphrase}
            className="mt-3 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Unlock"}
          </button>
          {error && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
        <p className="mt-3 text-sm text-rose-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  if (data.deliveries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
        <Film className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 font-display text-lg font-semibold">Nothing here yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your films haven't been delivered to this page yet. Check back soon, or
          contact {data.siteContact}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Your deliverables</h2>
        <span className="text-xs text-muted-foreground">
          {data.deliveries.length} file{data.deliveries.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid gap-4">
        {data.deliveries.map((d, i) => {
          const Icon = TYPE_ICONS[d.type] || Download;
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/40 md:p-6"
            >
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-brand/0 blur-3xl transition-all duration-500 group-hover:bg-brand/10" />

              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold">{d.label}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {d.type.replace(/_/g, " ").toLowerCase()}
                </p>
                {d.notes && (
                  <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
                    {d.notes}
                  </p>
                )}
              </div>

              {d.url && (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="pt-4 text-center text-xs text-muted-foreground">
        Download links expire — save your files to your computer or cloud drive.
      </p>
    </div>
  );
}

void ImageIcon;
void cn;
