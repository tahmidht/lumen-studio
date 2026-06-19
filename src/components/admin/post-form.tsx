"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaInput } from "@/components/admin/media-input";
import { TagsInput } from "@/components/admin/tags-input";
import { AIAssistButton } from "@/components/admin/ai-assist-button";
import { AltTextButton } from "@/components/admin/alt-text-button";

type Data = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAlt: string;
  tags: string[];
  author: string;
  published: boolean;
};

export function PostForm({ initial, isNew }: { initial?: Partial<Data>; isNew?: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Data>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? "",
    coverImageAlt: initial?.coverImageAlt ?? "",
    tags: initial?.tags ?? [],
    author: initial?.author ?? "",
    published: initial?.published ?? true,
  });

  function set<K extends keyof Data>(k: K, v: Data[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(publish?: boolean) {
    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, published: publish ?? form.published };
      const url = isNew ? "/api/posts" : `/api/posts/${form.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success(isNew ? "Post created" : "Post saved");
      if (isNew) router.push(`/admin/journal/${json.data.id}`);
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
                    e.target.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
                  );
              }}
              placeholder="Chasing First Light in the Dolomites"
            />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Excerpt" hint="Short summary shown on cards.">
            <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} />
          </Field>
          <Field label="Content *" hint="Markdown supported. Use # for headings.">
            <Textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={18}
              className="font-mono text-sm scroll-cinema"
              placeholder="# Heading&#10;&#10;Write your story…"
            />
            <AIAssistButton<{ markdown: string }>
              endpoint="/api/ai/blog-outline"
              payload={{
                title: form.title,
                tags: form.tags,
                excerpt: form.excerpt,
              }}
              onResult={(data) => set("content", data.markdown)}
              label="Generate outline + draft"
              size="sm"
              disabled={!form.title}
            />
          </Field>
        </Section>
      </div>
      <div className="space-y-6">
        <Section title="Publish">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
            <p className="text-sm font-medium">Published</p>
            <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save()} disabled={saving} className="flex-1 bg-brand text-black hover:bg-brand/90">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isNew ? "Create" : "Save"}
            </Button>
            {!isNew && (
              <Button variant="outline" onClick={() => save(!form.published)} disabled={saving}>
                {form.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </Section>
        <Section title="Cover Image">
          <MediaInput value={form.coverImage} onChange={(v) => set("coverImage", v)} />
          <Field label="Cover image alt text" hint="Describes the image for screen readers & SEO.">
            <div className="flex gap-2">
              <Input
                value={form.coverImageAlt}
                onChange={(e) => set("coverImageAlt", e.target.value)}
                placeholder="e.g. Cinematographer filming the Dolomites at sunrise"
              />
              <AltTextButton
                imageUrl={form.coverImage}
                onResult={(alt) => set("coverImageAlt", alt)}
              />
            </div>
          </Field>
        </Section>
        <Section title="Meta">
          <Field label="Author">
            <Input value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="Studio Admin" />
          </Field>
          <Field label="Tags">
            <TagsInput values={form.tags} onChange={(v) => set("tags", v)} />
          </Field>
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
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
