"use client";
import { useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PingResult = {
  engine: string;
  status: number;
  ok: boolean;
  url: string;
  error?: string;
};

/**
 * Admin SEO ping button — submits the sitemap.xml to Google + Bing.
 * Shows per-engine status after the ping completes.
 */
export function SeoPingButton() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PingResult[] | null>(null);
  const [sitemapUrl, setSitemapUrl] = useState<string | null>(null);

  async function ping() {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/seo/ping", { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Ping failed");
      setResults(json.data.results);
      setSitemapUrl(json.data.sitemapUrl);
      const okCount = json.data.results.filter((r: PingResult) => r.ok).length;
      if (okCount === json.data.results.length) {
        toast.success(`Pinged ${okCount} search engines successfully`);
      } else if (okCount > 0) {
        toast.message(`Pinged ${okCount}/${json.data.results.length} engines (some failed — see details)`);
      } else {
        toast.error("All pings failed — check network or run in production");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ping failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">Submit sitemap to search engines</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pings Google + Bing with your <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">/sitemap.xml</code> URL so they crawl your latest content.
          </p>
        </div>
        <Button
          onClick={ping}
          disabled={loading}
          variant="outline"
          className="shrink-0 border-border bg-background"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {loading ? "Pinging…" : "Ping now"}
        </Button>
      </div>

      {sitemapUrl && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-3 text-xs">
          <span className="text-muted-foreground">Sitemap URL:</span>
          <a
            href={sitemapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-brand hover:underline"
          >
            {sitemapUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {results && (
        <div className="space-y-2">
          {results.map((r) => (
            <div
              key={r.engine}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border p-3 text-sm",
                r.ok
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-rose-500/30 bg-rose-500/5"
              )}
            >
              <div className="flex items-center gap-2.5">
                {r.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
                <span className="font-medium">{r.engine}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {r.ok ? (
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-emerald-500">
                    HTTP {r.status}
                  </span>
                ) : (
                  <span className="rounded bg-rose-500/15 px-1.5 py-0.5 font-mono text-rose-500">
                    {r.error || `HTTP ${r.status}`}
                  </span>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Note: pings may fail in sandboxed dev environments. In production
            (with a real domain + outbound network), they submit your sitemap
            for crawling.
          </p>
        </div>
      )}
    </div>
  );
}
