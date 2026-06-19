"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagsInput } from "@/components/admin/tags-input";

const ICONS = [
  "Camera",
  "Video",
  "Palette",
  "Plane",
  "Clapperboard",
  "Sparkles",
] as const;

type ServiceData = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
  priceFrom: string;
  order: number;
  published: boolean;
};

export function ServiceForm({
  initial,
  isNew,
}: {
  initial?: Partial<ServiceData>;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ServiceData>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    icon: initial?.icon ?? "Camera",
    features: initial?.features ?? [],
    priceFrom: initial?.priceFrom ?? "",
    order: initial?.order ?? 0,
    published: initial?.published ?? true,
  });

  function set<K extends keyof ServiceData>(k: K, v: ServiceData[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? "/api/services" : `/api/services/${form.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success(isNew ? "Service created" : "Service saved");
      if (isNew) router.push(`/admin/services/${json.data.id}`);
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
        <Section title="Content">
          <Field label="Title *">
            <Input
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (isNew)
                  set(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-")
                  );
              }}
              placeholder="Cinematography"
            />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Description *">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
            />
          </Field>
          <Field label="Features" hint="What's included.">
            <TagsInput values={form.features} onChange={(v) => set("features", v)} />
          </Field>
        </Section>
      </div>
      <div className="space-y-6">
        <Section title="Publish">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
            <div>
              <p className="text-sm font-medium">Published</p>
            </div>
            <Switch
              checked={form.published}
              onCheckedChange={(v) => set("published", v)}
            />
          </div>
          <Field label="Order">
            <Input
              type="number"
              value={form.order}
              onChange={(e) => set("order", Number(e.target.value))}
            />
          </Field>
          <Button
            onClick={save}
            disabled={saving}
            className="w-full bg-brand text-black hover:bg-brand/90"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isNew ? "Create" : "Save"}
          </Button>
        </Section>
        <Section title="Display">
          <Field label="Icon">
            <Select value={form.icon} onValueChange={(v) => set("icon", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Price from">
            <Input
              value={form.priceFrom}
              onChange={(e) => set("priceFrom", e.target.value)}
              placeholder="$2,500/day"
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
