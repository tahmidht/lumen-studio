"use client";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * AI test button — makes a simple test call to verify the Gemini API key
 * is working. Renders in Settings → AI tab.
 *
 * On success: shows a green checkmark + the test response.
 * On failure: shows a red X + the error message (rate limit, location block, etc.)
 */
export function AiTestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function test() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Say 'AI is working' in exactly those words. Nothing else.",
          maxOutputTokens: 15,
          temperature: 0,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        const errorMsg = json.error || "Unknown error";
        setResult({ ok: false, message: errorMsg });
        if (res.status === 429) {
          toast.error("Rate limit reached", { description: errorMsg });
        } else if (res.status === 400 && errorMsg.includes("location")) {
          toast.error("Location not supported", {
            description: "Google blocks this region. Try from a supported location or use a VPN.",
          });
        } else {
          toast.error("AI test failed", { description: errorMsg });
        }
      } else {
        setResult({
          ok: true,
          message: json.data.text?.trim() || "AI responded successfully",
        });
        toast.success("AI is working!", {
          description: "Gemini API key is valid + responding.",
        });
      }
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Network error",
      });
      toast.error("Network error", {
        description: err instanceof Error ? err.message : "fetch failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={test}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
          loading
            ? "border-border text-muted-foreground"
            : "border-brand/40 text-brand hover:bg-brand/5"
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "Testing…" : "Test AI connection"}
      </button>

      {result && (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-lg border p-3 text-sm",
            result.ok
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-rose-500/30 bg-rose-500/5"
          )}
        >
          {result.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          )}
          <div className="min-w-0">
            <p className={cn("font-medium", result.ok ? "text-emerald-500" : "text-rose-500")}>
              {result.ok ? "Connection successful" : "Connection failed"}
            </p>
            <p className="mt-0.5 break-words text-xs text-muted-foreground">
              {result.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
