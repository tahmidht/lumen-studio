"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Alt-text generator button — calls /api/ai/alt-text with the image URL/path
 * + fills the target input on success. Uses Gemini vision.
 *
 * Place next to any alt-text input that has a companion image URL.
 */
export function AltTextButton({
  imageUrl,
  onResult,
  size = "sm",
  className,
}: {
  imageUrl: string;
  onResult: (altText: string) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!imageUrl || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/alt-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const json = await res.json();
      if (!json.ok) {
        if (res.status === 429) {
          toast.error("AI rate limit reached", { description: json.error });
        } else if (res.status === 403) {
          toast.error("AI features disabled", { description: "Enable in Settings → AI." });
        } else {
          toast.error("Alt-text generation failed", { description: json.error });
        }
        return;
      }
      onResult(json.data.altText);
      toast.success("Alt-text generated");
    } catch (err) {
      toast.error("Network error", {
        description: err instanceof Error ? err.message : "fetch failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={generate}
      disabled={loading || !imageUrl}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-brand/40 px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/5 disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      title="Generate alt-text with AI"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {loading ? "Generating…" : "Auto-alt"}
    </button>
  );
}
