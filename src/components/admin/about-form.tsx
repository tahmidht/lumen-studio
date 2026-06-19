"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaInput } from "@/components/admin/media-input";
import { TagsInput } from "@/components/admin/tags-input";
import type { SiteConfig } from "@/lib/types";

export function AboutForm({ config }: { config: SiteConfig }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState(config.aboutBio);
  const [image, setImage] = useState(config.aboutImage);
  const [stats, setStats] = useState(config.aboutStats);
  const [skills, setSkills] = useState(config.aboutSkills);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutBio: bio,
          aboutImage: image,
          aboutStats: stats,
          aboutSkills: skills,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success("About section saved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Section title="Bio">
          <Field label="Biography" hint="Tell visitors who you are and what you do.">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={8} />
          </Field>
        </Section>
        <Section title="Stats" hint="The numbers shown beside your bio.">
          <div className="space-y-3">
            {stats.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={s.value}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], value: e.target.value };
                    setStats(next);
                  }}
                  placeholder="10+"
                  className="w-28"
                />
                <Input
                  value={s.label}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], label: e.target.value };
                    setStats(next);
                  }}
                  placeholder="Years Behind the Lens"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setStats(stats.filter((_, idx) => idx !== i))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStats([...stats, { label: "", value: "" }])}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add stat
            </Button>
          </div>
        </Section>
        <Section title="Skills">
          <TagsInput values={skills} onChange={setSkills} label="Skill tags" />
        </Section>
      </div>
      <div className="space-y-6">
        <Section title="Portrait Image">
          <MediaInput value={image} onChange={setImage} />
        </Section>
        <Button onClick={save} disabled={saving} className="w-full bg-brand text-black hover:bg-brand/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save About
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {hint && <p className="mb-4 text-xs text-muted-foreground/70">{hint}</p>}
      <div className={hint ? "" : "mt-4"}>{children}</div>
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
