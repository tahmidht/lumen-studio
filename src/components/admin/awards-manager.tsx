"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Trash2, Plus, X, Award as AwardIcon } from "lucide-react";
import { toast } from "sonner";
import { ReorderManager, DragRow } from "@/components/admin/reorder-manager";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import type { Award } from "@/lib/types";

/**
 * Awards manager: grid view with inline create + per-item edit toggles,
 * plus a drag-to-reorder mode. Simpler entity → no separate detail pages.
 */
export function AwardsManager({ awards }: { awards: Award[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            setCreating((v) => !v);
            setEditingId(null);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
        >
          {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {creating ? "Cancel" : "New Award"}
        </button>
      </div>

      {creating && (
        <AwardForm
          onDone={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      )}

      <ReorderManager
        items={awards}
        entity="award"
        countLabel={`${awards.length} award${awards.length === 1 ? "" : "s"}`}
        gridView={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {awards.map((a) =>
              editingId === a.id ? (
                <AwardForm
                  key={a.id}
                  initial={a}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                />
              ) : (
                <Card key={a.id} className="border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        {a.label}
                      </h3>
                      {a.note && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {a.note}
                        </p>
                      )}
                      <p className="mt-1 font-mono text-xs text-brand/70">
                        {a.year}
                      </p>
                    </div>
                    {!a.published && (
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <button
                      onClick={() => setEditingId(a.id)}
                      className="text-sm text-brand hover:underline"
                    >
                      Edit
                    </button>
                    <div className="flex items-center gap-1">
                      <DuplicateButton endpoint={`/api/awards/${a.id}/duplicate`} />
                      <DeleteButton endpoint={`/api/awards/${a.id}`} size="sm" />
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        }
        renderRow={(item, handle) => (
          <DragRow handle={handle}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <AwardIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-display text-sm font-semibold">
                  {item.label}
                </h4>
                {!item.published && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                    Draft
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {[item.note, item.year].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-brand/10 px-2 py-0.5 font-mono text-xs text-brand">
              #{item.order}
            </span>
          </DragRow>
        )}
      />
    </div>
  );
}

/** Inline create/edit form for a single award. */
function AwardForm({
  initial,
  onDone,
}: {
  initial?: Partial<Award>;
  onDone: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: initial?.label ?? "",
    year: initial?.year ?? "",
    note: initial?.note ?? "",
    published: initial?.published ?? true,
  });

  async function save() {
    if (!form.label) {
      toast.error("Label is required");
      return;
    }
    setSaving(true);
    try {
      const url = initial?.id
        ? `/api/awards/${initial.id}`
        : "/api/awards";
      const res = await fetch(url, {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success(initial?.id ? "Award updated" : "Award created");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-brand/30 bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Label *
          </Label>
          <Input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Cannes Lions"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Year
          </Label>
          <Input
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            placeholder="2024"
          />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Note
        </Label>
        <Input
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="Shortlist"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={form.published}
            onCheckedChange={(v) => setForm({ ...form, published: v })}
          />
          <span className="text-xs text-muted-foreground">Published</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDone}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {initial?.id ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </Card>
  );
}

// satisfy unused import
void Trash2;
