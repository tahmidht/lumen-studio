"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaInput } from "@/components/admin/media-input";
import { GEAR_CATEGORIES, gearCategoryLabel } from "@/lib/constants";

type Data = {
  id?: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  image: string;
  order: number;
};

export function GearForm({ initial, isNew }: { initial?: Partial<Data>; isNew?: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Data>({
    name: initial?.name ?? "",
    category: initial?.category ?? "CAMERA",
    brand: initial?.brand ?? "",
    description: initial?.description ?? "",
    image: initial?.image ?? "",
    order: initial?.order ?? 0,
  });

  function set<K extends keyof Data>(k: K, v: Data[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? "/api/gear" : `/api/gear/${form.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success(isNew ? "Gear added" : "Gear saved");
      if (isNew) router.push(`/admin/gear/${json.data.id}`);
      else router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Section title="Details">
          <Field label="Name *">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="ARRI Alexa Mini LF" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GEAR_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{gearCategoryLabel(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Brand">
              <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="ARRI" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
          </Field>
        </Section>
      </div>
      <div className="space-y-6">
        <Section title="Publish">
          <Field label="Order">
            <Input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
          </Field>
          <Button onClick={save} disabled={saving} className="w-full bg-brand text-black hover:bg-brand/90">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isNew ? "Create" : "Save"}
          </Button>
        </Section>
        <Section title="Image">
          <MediaInput value={form.image} onChange={(v) => set("image", v)} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
