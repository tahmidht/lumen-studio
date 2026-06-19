"use client";
import { useState, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Reusable AI Assist button — the consistent "✨ Write with AI" pattern.
 *
 * Props:
 *   endpoint  — the /api/ai/* route to call
 *   payload   — the request body (typed per feature)
 *   onResult  — callback receiving the AI response data
 *   label     — button label (default "Write with AI")
 *   size      — "sm" | "md" | "icon"
 *   variant   — "ghost" | "outline" | "solid"
 *   className — extra classes
 *
 * Handles: loading state, error toasts, rate-limit messages, disabled state
 * when AI isn't configured (the parent can pass `disabled` to preempt).
 */
export function AIAssistButton<TResponse = { text: string }>({
  endpoint,
  payload,
  onResult,
  label = "Write with AI",
  size = "md",
  variant = "outline",
  disabled = false,
  className,
}: {
  endpoint: string;
  payload: Record<string, unknown>;
  onResult: (data: TResponse) => void;
  label?: string;
  size?: "sm" | "md" | "icon";
  variant?: "ghost" | "outline" | "solid";
  disabled?: boolean;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) {
        // Friendly error messages for common cases
        if (res.status === 429) {
          toast.error("AI rate limit reached", { description: json.error });
        } else if (res.status === 403) {
          toast.error("AI features are disabled", {
            description: "Enable them in Settings → AI.",
          });
        } else if (res.status === 400) {
          toast.error("AI not configured", {
            description: json.error || "Add a Gemini API key in Settings → AI.",
          });
        } else {
          toast.error("AI request failed", { description: json.error });
        }
        return;
      }
      onResult(json.data as TResponse);
      toast.success("AI draft generated", {
        description: "Review and edit before saving.",
      });
    } catch (err) {
      toast.error("Network error", {
        description: err instanceof Error ? err.message : "fetch failed",
      });
    } finally {
      setLoading(false);
    }
  }, [endpoint, payload, onResult, loading, disabled]);

  const sizeClasses = {
    sm: "h-7 px-2.5 text-xs gap-1",
    md: "h-9 px-3 text-sm gap-1.5",
    icon: "h-7 w-7 p-0",
  }[size];

  const variantClasses = {
    ghost: "text-brand hover:bg-brand/10",
    outline: "border border-brand/40 text-brand hover:bg-brand/5",
    solid: "bg-brand text-black hover:brightness-110",
  }[variant];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses,
        variantClasses,
        className
      )}
      title={label}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {size !== "icon" && <span>{loading ? "Generating…" : label}</span>}
    </button>
  );
}
