"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

/** Delete button with confirmation dialog that calls DELETE on an entity API. */
export function DeleteButton({
  endpoint,
  redirectTo,
  label = "Delete",
  size = "default",
}: {
  endpoint: string;
  redirectTo?: string;
  label?: string;
  size?: "default" | "sm" | "icon";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function doDelete() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Delete failed");
      toast.success("Deleted successfully");
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white ${
            size === "sm" ? "px-3 py-1.5 text-xs" : size === "icon" ? "h-9 w-9 justify-center" : "px-4 py-2 text-sm"
          }`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {size !== "icon" && label}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The item will be permanently removed
            from your site.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={doDelete}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
