"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Duplicate button — clones an entity via POST to /api/{entity}/{id}/duplicate.
 * On success, navigates to the new entity's edit page (if `editHref` given),
 * otherwise just refreshes the current view (useful for inline-editor entities
 * like awards).
 */
export function DuplicateButton({
  endpoint,
  editHref,
  size = "sm",
}: {
  endpoint: string;
  /** Base path of the edit page, e.g. "/admin/projects". When omitted, the button refreshes the current view instead of navigating. */
  editHref?: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function duplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Duplicate failed");
      toast.success("Duplicated — review and publish");
      if (editHref) {
        router.push(`${editHref}/${json.data.id}`);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duplicate failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={duplicate}
      disabled={loading}
      title="Duplicate"
      className={
        "inline-flex items-center gap-1 rounded-md border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-50 " +
        (size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm")
      }
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {size !== "sm" && "Duplicate"}
    </button>
  );
}
