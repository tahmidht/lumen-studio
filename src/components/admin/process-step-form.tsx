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
import { MediaInput } from "@/components/admin/media-input";

type Data = {
  id?: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  phase: string;
  order: number;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export function ProcessStepForm({
  initial,
  isNew,
}: {
  initial?: Partial<Data>;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Data>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    image: initial?.image ?? "",
    imageAlt: initial?.imageAlt ?? "",
    phase: initial?.phase ?? "",
    order: initial?.order ?? 0,
    published: initial?.published ?? true,
  });

  function set<K extends keyof Data>(k: K, v: Data[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? "/api/process-steps" : `/api/process-steps/${form.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success(isNew ? "Process step created" : "Process step saved");
      if (isNew) router.push(`/admin/process/${json.data.id}`);
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
        <Section title="Step content">
          <Field label="Title *" hint="e.g. 'Discovery & Vision', 'Shoot Day', 'Color Grade'">
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Shoot Day"
            />
          </Field>
          <Field label="Description *" hint="2–4 sentences. Tell the story of this stage.">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
              placeholder="On set with cinema cameras, gimbals, drones…"
            />
          </Field>
          <Field label="Phase" hint="Group label — steps with the same phase render together. e.g. 'Pre-production', 'Post-production'">
            <Input
              value={form.phase}
              onChange={(e) => set("phase", e.target.value)}
              placeholder="Pre-production"
            />
          </Field>
        </Section>

        <Section title="Behind-the-Scenes image" hint="Optional. Adds a cinematic photo to the step.">
          <MediaInput
            value={form.image}
            onChange={(v) => set("image", v)}
            preview
          />
          <Field label="Image alt text" hint="Accessibility + SEO. Describe the photo for screen readers.">
            <Input
              value={form.imageAlt}
              onChange={(e) => set("imageAlt", e.target.value)}
              placeholder="Cinematographer operating a gimbal on a commercial set"
            />
          </Field>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Publish">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
            <Label htmlFor="pub" className="text-sm font-medium">
              Published
            </Label>
            <Switch
              id="pub"
              checked={form.published}
              onCheckedChange={(v) => set("published", v)}
            />
          </div>
          <Field label="Order" hint="Lower numbers render first.">
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
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {hint && <p className="mb-4 text-xs text-muted-foreground/70">{hint}</p>}
      <div className={hint ? "space-y-4" : "mt-4 space-y-4"}>{children}</div>
    </div>
  );
}
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
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
