"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Star toggle for an inquiry — admin can mark important inquiries.
 * Optimistic UI: flips immediately, reverts on error.
 */
export function InquiryStarButton({
  inquiryId,
  starred,
  size = "md",
  withLabel = false,
}: {
  inquiryId: string;
  starred: boolean;
  size?: "sm" | "md";
  withLabel?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !starred }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success(!starred ? "Starred" : "Unstarred");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={starred ? "Unstar" : "Star this inquiry"}
      aria-label={starred ? "Unstar" : "Star this inquiry"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50",
        dim,
        starred
          ? "border-brand bg-brand/15 text-brand"
          : "border-border bg-card text-muted-foreground hover:border-brand/50 hover:text-brand"
      )}
    >
      {loading ? (
        <Loader2 className={cn(icon, "animate-spin")} />
      ) : (
        <Star className={cn(icon, starred && "fill-current")} />
      )}
      {withLabel && (
        <span className="ml-1.5 text-xs">
          {starred ? "Starred" : "Star"}
        </span>
      )}
    </button>
  );
}
