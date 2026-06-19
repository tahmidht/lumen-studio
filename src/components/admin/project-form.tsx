"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { MediaInput } from "@/components/admin/media-input";
import { TagsInput } from "@/components/admin/tags-input";
import { AIAssistButton } from "@/components/admin/ai-assist-button";
import { AltTextButton } from "@/components/admin/alt-text-button";
import { SocialPostsModal } from "@/components/admin/social-posts-modal";
import { PROJECT_CATEGORIES, categoryLabel } from "@/lib/constants";

type ProjectData = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  client: string;
  year: string;
  location: string;
  role: string;
  description: string;
  excerpt: string;
  thumbnail: string;
  thumbnailAlt: string;
  posterImage: string;
  videoUrl: string;
  gallery: string[];
  btsGallery: { image: string; alt: string; caption?: string }[];
  tags: string[];
  featured: boolean;
  published: boolean;
  order: number;
};

export function ProjectForm({
  initial,
  isNew,
}: {
  initial?: Partial<ProjectData>;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [form, setForm] = useState<ProjectData>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    category: initial?.category ?? "FILM",
    client: initial?.client ?? "",
    year: initial?.year ?? String(new Date().getFullYear()),
    location: initial?.location ?? "",
    role: initial?.role ?? "",
    description: initial?.description ?? "",
    excerpt: initial?.excerpt ?? "",
    thumbnail: initial?.thumbnail ?? "",
    thumbnailAlt: initial?.thumbnailAlt ?? "",
    posterImage: initial?.posterImage ?? "",
    videoUrl: initial?.videoUrl ?? "",
    gallery: initial?.gallery ?? [],
    btsGallery: initial?.btsGallery ?? [],
    tags: initial?.tags ?? [],
    featured: initial?.featured ?? false,
    published: initial?.published ?? true,
    order: initial?.order ?? 0,
  });

  function set<K extends keyof ProjectData>(key: K, value: ProjectData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(publish?: boolean) {
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, published: publish ?? form.published };
      const url = isNew ? "/api/projects" : `/api/projects/${form.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success(isNew ? "Project created" : "Project saved");
      if (isNew) {
        router.push(`/admin/projects/${json.data.id}`);
      } else {
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <Section title="Content">
          <Field label="Title *">
            <Input
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (isNew) set("slug", slugifyLive(e.target.value));
              }}
              placeholder="e.g. Echoes of the Valley"
            />
          </Field>
          <Field label="Slug">
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="echoes-of-the-valley"
            />
          </Field>
          <Field label="Excerpt" hint="Short one-liner shown on cards.">
            <Textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              placeholder="A one-line summary."
            />
          </Field>
          <Field label="Description *" hint="Full project description.">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={7}
              placeholder="Tell the story of this film…"
            />
            <div className="flex flex-wrap items-center gap-2">
              <AIAssistButton
                endpoint="/api/ai/project-desc"
                payload={{
                  title: form.title,
                  category: form.category,
                  client: form.client,
                  year: form.year ? Number(form.year) : null,
                  location: form.location,
                  role: form.role,
                  excerpt: form.excerpt,
                  tags: form.tags,
                }}
                onResult={(data) => set("description", data.text)}
                label="Write description"
                size="sm"
                disabled={!form.title}
              />
              <button
                type="button"
                onClick={() => setSocialOpen(true)}
                disabled={!form.title}
                className="inline-flex items-center gap-1 rounded-md border border-brand/40 px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-3 w-3" />
                Social posts
              </button>
              {!form.title && (
                <span className="text-xs text-muted-foreground">
                  Add a title first to enable AI
                </span>
              )}
            </div>
          </Field>
        </Section>

        <Section title="Media">
          <Field label="Thumbnail" hint="Used on cards & listings (4:3 or 16:9).">
            <MediaInput
              value={form.thumbnail}
              onChange={(v) => set("thumbnail", v)}
            />
          </Field>
          <Field label="Thumbnail alt text" hint="Describes the image for screen readers & SEO.">
            <div className="flex gap-2">
              <Input
                value={form.thumbnailAlt}
                onChange={(e) => set("thumbnailAlt", e.target.value)}
                placeholder="e.g. Cinematic wide shot of the Dolomites at sunrise"
              />
              <AltTextButton
                imageUrl={form.thumbnail}
                onResult={(alt) => set("thumbnailAlt", alt)}
              />
            </div>
          </Field>
          <Field label="Poster image" hint="Optional large hero image for the project page.">
            <MediaInput
              value={form.posterImage}
              onChange={(v) => set("posterImage", v)}
            />
          </Field>
          <Field label="Video URL" hint="YouTube/Vimeo embed URL or direct .mp4.">
            <Input
              value={form.videoUrl}
              onChange={(e) => set("videoUrl", e.target.value)}
              placeholder="https://vimeo.com/…"
            />
          </Field>
          <Field label="Gallery images">
            <GalleryEditor
              values={form.gallery}
              onChange={(v) => set("gallery", v)}
            />
          </Field>
          <Field
            label="Behind-the-Scenes gallery"
            hint="Optional. Richer than the main gallery — each BTS photo can have a caption. Shown on the project detail page."
          >
            <BtsGalleryEditor
              values={form.btsGallery}
              onChange={(v) => set("btsGallery", v)}
            />
          </Field>
        </Section>
      </div>

      {/* Sidebar column */}
      <div className="space-y-6">
        <Section title="Publish">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
            <div>
              <p className="text-sm font-medium">Published</p>
              <p className="text-xs text-muted-foreground">Visible on the site.</p>
            </div>
            <Switch
              checked={form.published}
              onCheckedChange={(v) => set("published", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
            <div>
              <p className="text-sm font-medium">Featured</p>
              <p className="text-xs text-muted-foreground">Surfaces on homepage.</p>
            </div>
            <Switch
              checked={form.featured}
              onCheckedChange={(v) => set("featured", v)}
            />
          </div>
          <Field label="Order">
            <Input
              type="number"
              value={form.order}
              onChange={(e) => set("order", Number(e.target.value))}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              onClick={() => save()}
              disabled={saving}
              className="flex-1 bg-brand text-black hover:bg-brand/90"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isNew ? "Create" : "Save"}
            </Button>
            {!isNew && form.published && (
              <Button
                variant="outline"
                onClick={() => save(false)}
                disabled={saving}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            )}
            {!isNew && !form.published && (
              <Button
                variant="outline"
                onClick={() => save(true)}
                disabled={saving}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Section>

        <Section title="Details">
          <Field label="Category">
            <Select
              value={form.category}
              onValueChange={(v) => set("category", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoryLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Client">
            <Input
              value={form.client}
              onChange={(e) => set("client", e.target.value)}
              placeholder="Client or brand name"
            />
          </Field>
          <Field label="Year">
            <Input
              type="number"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
            />
          </Field>
          <Field label="Location">
            <Input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Dolomites, Italy"
            />
          </Field>
          <Field label="Role">
            <Input
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Director of Photography"
            />
          </Field>
        </Section>

        <Section title="Tags">
          <TagsInput
            values={form.tags}
            onChange={(v) => set("tags", v)}
            label="Tags"
          />
        </Section>
      </div>

      {/* AI: Social posts modal */}
      <SocialPostsModal
        open={socialOpen}
        onClose={() => setSocialOpen(false)}
        projectDetails={{
          title: form.title,
          category: form.category,
          excerpt: form.excerpt,
          tags: form.tags,
          siteName: "LUMEN",
        }}
      />
    </div>
  );
}

function slugifyLive(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
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

function GalleryEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((url, i) => (
            <div
              key={i}
              className="group relative aspect-video overflow-hidden rounded-md border border-border bg-background"
            >
              { }
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <MediaInput
        value=""
        onChange={(url) => {
          if (url) onChange([...values, url]);
        }}
        label="Add image to gallery"
        preview={false}
      />
    </div>
  );
}

/** Behind-the-Scenes gallery editor — each entry has an image + alt + optional caption. */
function BtsGalleryEditor({
  values,
  onChange,
}: {
  values: { image: string; alt: string; caption?: string }[];
  onChange: (v: { image: string; alt: string; caption?: string }[]) => void;
}) {
  function add(url: string) {
    if (!url) return;
    onChange([...values, { image: url, alt: "" }]);
  }
  function update(i: number, patch: Partial<{ image: string; alt: string; caption: string }>) {
    onChange(values.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  return (
    <div className="space-y-3">
      {values.length > 0 && (
        <div className="space-y-3">
          {values.map((entry, i) => (
            <div
              key={i}
              className="relative rounded-lg border border-border bg-background/40 p-3"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                  {entry.image ? (
                    <img src={entry.image} alt={entry.alt || ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">no image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={entry.alt}
                    onChange={(e) => update(i, { alt: e.target.value })}
                    placeholder="Alt text (accessibility)"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={entry.caption ?? ""}
                    onChange={(e) => update(i, { caption: e.target.value })}
                    placeholder="Caption (optional) — e.g. 'Setting up the gimbal at dawn'"
                    className="h-8 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <MediaInput
                      value={entry.image}
                      onChange={(url) => update(i, { image: url })}
                      label="Image URL"
                      preview={false}
                    />
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <MediaInput
        value=""
        onChange={add}
        label="Add BTS photo"
        preview={false}
      />
    </div>
  );
}
