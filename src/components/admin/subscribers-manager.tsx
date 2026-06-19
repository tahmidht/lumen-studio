"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/delete-button";
import { cn } from "@/lib/utils";
import type { Subscriber } from "@/lib/types";

export function SubscribersManager({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggle(id: string, active: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/subscribers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success(active ? "Deactivated" : "Reactivated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setTogglingId(null);
    }
  }

  if (subscribers.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 border-dashed py-20 text-center">
        <Mail className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-display text-lg font-semibold">
          No subscribers yet
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Signups from your footer newsletter form will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {subscribers.map((s) => (
        <Card
          key={s.id}
          className="flex items-center gap-4 border-border bg-card p-4"
        >
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              s.active
                ? "bg-brand/15 text-brand"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Mail className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{s.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Subscribed{" "}
              {new Date(s.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
              s.active
                ? "bg-brand/15 text-brand"
                : "bg-muted text-muted-foreground"
            )}
          >
            {s.active ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggle(s.id, s.active)}
            disabled={togglingId === s.id}
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {togglingId === s.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : s.active ? (
              "Deactivate"
            ) : (
              "Reactivate"
            )}
          </button>
          <DeleteButton
            endpoint={`/api/subscribers/${s.id}`}
            size="sm"
          />
        </Card>
      ))}
    </div>
  );
}

void Check;
void X;
void Trash2;
