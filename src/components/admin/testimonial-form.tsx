"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Star, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaInput } from "@/components/admin/media-input";
import { cn } from "@/lib/utils";

type Data = {
  id?: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  order: number;
  published: boolean;
};

export function TestimonialForm({
  initial,
  isNew,
}: {
  initial?: Partial<Data>;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [replyCopied, setReplyCopied] = useState(false);
  const [form, setForm] = useState<Data>({
    name: initial?.name ?? "",
    role: initial?.role ?? "",
    company: initial?.company ?? "",
    content: initial?.content ?? "",
    rating: initial?.rating ?? 5,
    avatar: initial?.avatar ?? "",
    order: initial?.order ?? 0,
    published: initial?.published ?? true,
  });

  function set<K extends keyof Data>(k: K, v: Data[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.name || !form.content) {
      toast.error("Name and content are required");
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? "/api/testimonials" : `/api/testimonials/${form.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success(isNew ? "Testimonial created" : "Testimonial saved");
      if (isNew) router.push(`/admin/testimonials/${json.data.id}`);
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
          <Field label="Quote *">
            <Textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={5}
              placeholder="What did they say about your work?"
            />
          </Field>
          <Field label="Name *">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Maya Chen" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role">
              <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Bride" />
            </Field>
            <Field label="Company / Project">
              <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Vows at Golden Hour" />
            </Field>
          </div>
          <Field label="Rating">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("rating", n)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      n <= form.rating
                        ? "fill-brand text-brand"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
          </Field>
        </Section>
      </div>
      <div className="space-y-6">
        <Section title="Publish">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
            <p className="text-sm font-medium">Published</p>
            <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
          </div>
          <Field label="Order">
            <Input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
          </Field>
          <Button onClick={save} disabled={saving} className="w-full bg-brand text-black hover:bg-brand/90">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isNew ? "Create" : "Save"}
          </Button>
        </Section>
        <Section title="Avatar">
          <MediaInput value={form.avatar} onChange={(v) => set("avatar", v)} preview />
        </Section>
        {form.content && form.name && (
          <Section title="AI reply" hint="Draft a warm thank-you reply to this testimonial.">
            <button
              type="button"
              onClick={async () => {
                setReplyLoading(true);
                try {
                  const res = await fetch("/api/ai/testimonial-reply", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      testimonialContent: form.content,
                      name: form.name,
                      role: form.role,
                      company: form.company,
                      rating: form.rating,
                      siteName: "LUMEN",
                    }),
                  });
                  const json = await res.json();
                  if (!json.ok) throw new Error(json.error || "Failed");
                  setReply(json.data.text);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed");
                } finally {
                  setReplyLoading(false);
                }
              }}
              disabled={replyLoading}
              className="inline-flex items-center gap-1 rounded-md border border-brand/40 px-2.5 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand/5 disabled:opacity-50"
            >
              {replyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {replyLoading ? "Generating…" : "Draft reply"}
            </button>
            {reply && (
              <div className="relative">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(reply);
                    setReplyCopied(true);
                    setTimeout(() => setReplyCopied(false), 2000);
                    toast.success("Copied");
                  }}
                  className="absolute right-2 top-2 rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-brand"
                  title="Copy"
                >
                  {replyCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {hint && <p className="mb-4 text-xs text-muted-foreground/70">{hint}</p>}
      <div className={hint ? "space-y-4" : "mt-4 space-y-4"}>{children}</div>
    </div>
  );
}
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
