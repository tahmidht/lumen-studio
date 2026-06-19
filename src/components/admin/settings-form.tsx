"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Loader2, ExternalLink, Search, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaInput } from "@/components/admin/media-input";
import { SeoPingButton } from "@/components/admin/seo-ping-button";
import { AiUsagePanel } from "@/components/admin/ai-usage-panel";
import { AIAssistButton } from "@/components/admin/ai-assist-button";
import { AiTestButton } from "@/components/admin/ai-test-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { SiteConfig } from "@/lib/types";
import { FEATURE_FLAG_META, FEATURE_PRESETS } from "@/lib/feature-flags";

type ProjectOption = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  category: string;
};

export function SettingsForm({
  config,
  projects,
}: {
  config: SiteConfig;
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "brand";
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [form, setForm] = useState<SiteConfig>(config);

  function set<K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      toast.success("Settings saved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const selectedProject = projects.find((p) => p.id === form.bannerProjectId);

  return (
    <div className="space-y-6">
      <Tabs defaultValue={initialTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="brand">Brand & Hero</TabsTrigger>
          <TabsTrigger value="banner">Banner</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="mr-1 h-3 w-3" />
            AI
          </TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Brand">
              <Field label="Site name">
                <Input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <Input value={form.siteTagline} onChange={(e) => set("siteTagline", e.target.value)} />
              </Field>
              <Field label="Site description" hint="Used for SEO meta.">
                <Textarea value={form.siteDescription} onChange={(e) => set("siteDescription", e.target.value)} rows={3} />
              </Field>
              <Field label="Footer note">
                <Input value={form.footerNote} onChange={(e) => set("footerNote", e.target.value)} />
              </Field>
            </Section>
            <Section title="Hero">
              <Field label="Hero title">
                <Input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
              </Field>
              <Field label="Hero subtitle">
                <Textarea value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} rows={2} />
              </Field>
              <Field label="Hero poster image" hint="Full-bleed background.">
                <MediaInput value={form.heroPosterImage} onChange={(v) => set("heroPosterImage", v)} />
              </Field>
              <Field label="Showreel URL" hint="YouTube/Vimeo link for the watch button.">
                <Input value={form.showreelUrl} onChange={(e) => set("showreelUrl", e.target.value)} placeholder="https://vimeo.com/…" />
              </Field>
            </Section>
          </div>
        </TabsContent>

        {/* Banner tab — admin-selectable "Project of the Month" homepage banner */}
        <TabsContent value="banner" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Section
              title="Homepage Banner"
              hint="A full-width cinematic band above the featured-work grid. Pick any published project to spotlight as your “Project of the Month.”"
            >
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4">
                <div>
                  <p className="text-sm font-medium">Enable banner</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Toggle the banner on/off without losing your selection.
                  </p>
                </div>
                <Switch
                  checked={form.bannerEnabled}
                  onCheckedChange={(v) => set("bannerEnabled", v)}
                />
              </div>

              <Field label="Featured project" hint="Pick the project to spotlight. Drafts are marked.">
                <select
                  value={form.bannerProjectId ?? ""}
                  onChange={(e) => set("bannerProjectId", e.target.value || null)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">— Auto-pick first featured project —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                      {p.published ? "" : " (draft)"} · {p.category}
                    </option>
                  ))}
                </select>
              </Field>

              {selectedProject && (
                <div className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
                  <span className="text-muted-foreground">
                    Selected:{" "}
                    <span className="font-medium text-foreground">
                      {selectedProject.title}
                    </span>
                  </span>
                  <Link
                    href={`/work/${selectedProject.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              <Field label="Eyebrow label" hint="Small label above the headline. Defaults to “Featured Story.”">
                <Input
                  value={form.bannerEyebrow}
                  onChange={(e) => set("bannerEyebrow", e.target.value)}
                  placeholder="Featured Story"
                />
              </Field>

              <Field label="Headline override" hint="Leave blank to use the project’s own title.">
                <Input
                  value={form.bannerHeadline ?? ""}
                  onChange={(e) => set("bannerHeadline", e.target.value || null)}
                  placeholder={selectedProject?.title ?? "Project title"}
                />
              </Field>

              <Field label="CTA label">
                <Input
                  value={form.bannerCtaLabel}
                  onChange={(e) => set("bannerCtaLabel", e.target.value)}
                  placeholder="View the case study"
                />
              </Field>
            </Section>

            <Section title="Live preview" hint="A condensed preview of how the banner will render.">
              <div className="relative overflow-hidden rounded-xl border border-border" style={{ aspectRatio: "16 / 9" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-background to-teal-950/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-px w-6 bg-brand" />
                    <span className="label-eyebrow text-brand">
                      {form.bannerEyebrow || "Featured Story"}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-xl font-bold leading-tight text-white">
                    {form.bannerHeadline || selectedProject?.title || "Pick a project →"}
                  </p>
                  <p className="mt-1.5 text-xs text-white/60 line-clamp-2">
                    {selectedProject
                      ? `/${selectedProject.slug}`
                      : "No project selected yet."}
                  </p>
                  <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-black">
                    {form.bannerCtaLabel || "View the case study"}
                  </span>
                </div>
              </div>
              {!form.bannerEnabled && (
                <p className="text-xs text-amber-500">
                  Banner is currently disabled — toggle “Enable banner” above to show it on the homepage.
                </p>
              )}
            </Section>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Section title="Contact details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <Input value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
              </Field>
              <Field label="Phone">
                <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
              </Field>
              <Field label="Location">
                <Input value={form.contactLocation} onChange={(e) => set("contactLocation", e.target.value)} />
              </Field>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <Section title="Social links">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram URL">
                <Input value={form.socialInstagram} onChange={(e) => set("socialInstagram", e.target.value)} />
              </Field>
              <Field label="YouTube URL">
                <Input value={form.socialYoutube} onChange={(e) => set("socialYoutube", e.target.value)} />
              </Field>
              <Field label="Vimeo URL">
                <Input value={form.socialVimeo} onChange={(e) => set("socialVimeo", e.target.value)} />
              </Field>
              <Field label="LinkedIn URL">
                <Input value={form.socialLinkedin} onChange={(e) => set("socialLinkedin", e.target.value)} />
              </Field>
              <Field label="Behance URL">
                <Input value={form.socialBehance} onChange={(e) => set("socialBehance", e.target.value)} />
              </Field>
            </div>
          </Section>
        </TabsContent>

        {/* SEO tab — search-engine visibility + sitemap ping */}
        <TabsContent value="seo" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Section
              title="Search engine visibility"
              hint="Your sitemap.xml and robots.txt are auto-generated. Submit them to search engines to speed up indexing."
            >
              <SeoPingButton />

              <div className="mt-6 space-y-2 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Auto-generated files
                </p>
                <Link
                  href="/sitemap.xml"
                  target="_blank"
                  className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm transition-colors hover:border-brand/40"
                >
                  <span className="font-mono">/sitemap.xml</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/robots.txt"
                  target="_blank"
                  className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm transition-colors hover:border-brand/40"
                >
                  <span className="font-mono">/robots.txt</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>
            </Section>

            <Section
              title="SEO meta"
              hint="Used for the homepage <title> and <meta description>. Keep the description under 160 characters."
            >
              <Field label="Site name" hint="Used in <title> tags across the site.">
                <Input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
              </Field>
              <Field label="Site description" hint="The homepage meta description.">
                <Textarea
                  value={form.siteDescription}
                  onChange={(e) => set("siteDescription", e.target.value)}
                  rows={4}
                  placeholder="Award-winning cinematographer crafting cinematic stories…"
                />
                <AIAssistButton<{ description: string }>
                  endpoint="/api/ai/seo-meta"
                  payload={{
                    siteName: form.siteName,
                    tagline: form.siteTagline,
                    heroTitle: form.heroTitle,
                    currentDescription: form.siteDescription,
                  }}
                  onResult={(data) => set("siteDescription", data.description)}
                  label="Generate SEO description"
                  size="sm"
                />
              </Field>
              <p className="text-xs text-muted-foreground/70">
                {form.siteDescription.length}/160 characters
                {form.siteDescription.length > 160 && (
                  <span className="ml-1 text-amber-500">— may be truncated in search results</span>
                )}
              </p>
            </Section>
          </div>
        </TabsContent>

        {/* Notifications tab — email-notification settings for new inquiries */}
        <TabsContent value="notifications" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Section
              title="Inquiry notifications"
              hint="Send yourself an email every time a new inquiry lands. Configure your SMTP server below."
            >
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4">
                <div>
                  <p className="text-sm font-medium">Enable email notifications</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Fires a background email when a new inquiry is submitted.
                  </p>
                </div>
                <Switch
                  checked={form.notifyInquiriesEnabled}
                  onCheckedChange={(v) => set("notifyInquiriesEnabled", v)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="From email" hint="The sender address (e.g. noreply@yourstudio.com).">
                  <Input
                    type="email"
                    value={form.notifyFromEmail}
                    onChange={(e) => set("notifyFromEmail", e.target.value)}
                    placeholder="noreply@yourstudio.com"
                  />
                </Field>
                <Field label="To email" hint="Where to send the notification (usually you).">
                  <Input
                    type="email"
                    value={form.notifyToEmail}
                    onChange={(e) => set("notifyToEmail", e.target.value)}
                    placeholder="you@yourstudio.com"
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="SMTP server"
              hint="Connection details for your email provider. The password is stored in plaintext in the DB — for production, use an app-specific password or a transactional email service."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="SMTP host">
                  <Input
                    value={form.smtpHost}
                    onChange={(e) => set("smtpHost", e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </Field>
                <Field label="Port" hint="587 = plain/STARTTLS, 465 = TLS, 25 = unencrypted.">
                  <Input
                    value={form.smtpPort}
                    onChange={(e) => set("smtpPort", e.target.value)}
                    placeholder="587"
                  />
                </Field>
                <Field label="Username" hint="Usually your full email address.">
                  <Input
                    value={form.smtpUser}
                    onChange={(e) => set("smtpUser", e.target.value)}
                    placeholder="you@yourstudio.com"
                  />
                </Field>
                <Field label="Password" hint="App-specific password recommended.">
                  <Input
                    type="password"
                    value={form.smtpPassword}
                    onChange={(e) => set("smtpPassword", e.target.value)}
                    placeholder="••••••••••••"
                  />
                </Field>
              </div>

              {form.notifyInquiriesEnabled && (!form.smtpHost || !form.notifyToEmail) && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-500">
                  Notifications are enabled but SMTP host or recipient email is missing.
                  Fill in both fields to start receiving inquiry emails.
                </div>
              )}
              <div className="rounded-lg bg-background/40 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Implementation note</p>
                <p className="mt-1">
                  This scaffold logs the notification to the server console (and
                  activity log) instead of sending a real email — to keep the
                  project dependency-free. In production, swap the helper in
                  <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-[10px]">src/lib/notify.ts</code>
                  for Nodemailer or a transactional service (Resend, Postmark, SendGrid).
                </p>
              </div>
            </Section>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Section title="Accent color" hint="Sets the brand accent across the entire site.">
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                className="h-12 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
              />
              <Input
                value={form.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                className="max-w-[160px]"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-8 w-8 rounded-full border border-border" style={{ background: form.accentColor }} />
                Preview
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["#E8B547", "#D97757", "#7C9885", "#B85C8E", "#5B8FB9", "#C2410C", "#9F7AEA"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("accentColor", c)}
                  className="h-9 w-9 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ background: c, borderColor: form.accentColor === c ? "#fff" : "transparent" }}
                  aria-label={c}
                />
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* AI tab — Gemini 2.5 Flash integration + usage analytics */}
        <TabsContent value="ai" className="mt-6">
          <div className="space-y-6">
            <Section
              title="Gemini AI integration"
              hint="Powered by Google's free Gemini 2.5 Flash API. Get a free API key at aistudio.google.com/apikey. The key is stored server-side and never sent to the browser."
            >
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4">
                <div>
                  <p className="text-sm font-medium">Enable AI features</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Adds "✨ Write with AI" buttons across the dashboard (project descriptions, inquiry replies, alt-text, social posts, and more).
                  </p>
                </div>
                <Switch
                  checked={form.aiEnabled}
                  onCheckedChange={(v) => set("aiEnabled", v)}
                />
              </div>

              <Field label="Gemini API key" hint="Free at aistudio.google.com/apikey. Stored in your database — never exposed to the browser.">
                <div className="flex items-center gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={form.aiApiKey}
                    onChange={(e) => set("aiApiKey", e.target.value)}
                    placeholder="AIza…"
                    className="font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((v) => !v)}
                    className="shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
                    title={showApiKey ? "Hide" : "Show"}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Model" hint="gemini-2.5-flash is free + fast. Change only if you have access to a different model.">
                <Input
                  value={form.aiModel}
                  onChange={(e) => set("aiModel", e.target.value)}
                  placeholder="gemini-2.5-flash"
                  className="font-mono"
                />
              </Field>

              <Field label="Custom system prompt" hint="Optional. Override the default AI persona. Leave blank for the sensible default.">
                <Textarea
                  value={form.aiSystemPrompt}
                  onChange={(e) => set("aiSystemPrompt", e.target.value)}
                  rows={3}
                  placeholder="You are the AI assistant for a cinematographer…"
                />
              </Field>

              {form.aiEnabled && !form.aiApiKey && !process.env.GEMINI_API_KEY && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-500">
                  AI is enabled but no API key is set. Add your free Gemini key above to start using AI features.
                </div>
              )}

              <div className="rounded-lg bg-background/40 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Privacy note</p>
                <p className="mt-1">
                  When you use AI features, the relevant content (project details, inquiry text, images) is sent to Google's Gemini API for processing. Don't use AI on sensitive client data. See the <Link href="/privacy" target="_blank" className="text-brand hover:underline">privacy notice</Link>.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                Free tier: 15 requests/min, 1,500/day — plenty for a solo studio.
              </div>

              {/* Test connection */}
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Test connection
                </p>
                <AiTestButton />
              </div>
            </Section>

            {/* Usage analytics */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-10 bg-brand" />
                <span className="label-eyebrow text-brand">Usage</span>
              </div>
              <AiUsagePanel />
            </div>
          </div>
        </TabsContent>

        {/* Features tab — admin-toggleable premium UX features */}
        <TabsContent value="features" className="mt-6">
          {/* Presets */}
          <Section
            title="Presets"
            hint="Apply a curated combination of features with one click — you can still fine-tune individual toggles below."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {FEATURE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => set("featureFlags", { ...preset.flags })}
                  className="group rounded-lg border border-border bg-card/40 p-4 text-left transition-all hover:border-brand/50 hover:bg-card"
                >
                  <p className="text-sm font-semibold">{preset.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground text-pretty">
                    {preset.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    Apply →
                  </span>
                </button>
              ))}
            </div>
          </Section>

          <Section
            title="Feature flags"
            hint="Control the premium UX features shown on your public site. Turn any off if it doesn't fit your audience."
          >
            {/* Cursor mode selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Custom cursor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["magnetic", "default", "none"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        featureFlags: { ...f.featureFlags, cursorMode: m },
                      }))
                    }
                    className={
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
                      (form.featureFlags.cursorMode === m
                        ? "border-brand bg-brand text-black"
                        : "border-border bg-card/40 text-muted-foreground hover:border-brand/50 hover:text-foreground")
                    }
                  >
                    {m === "magnetic"
                      ? "Magnetic (full)"
                      : m === "default"
                      ? "Ring only"
                      : "Off"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/70">
                Magnetic = dot + ring (premium). Ring only = subtler. Off = native cursor.
              </p>
            </div>

            {/* Boolean toggles */}
            <div className="mt-6 space-y-3">
              {FEATURE_FLAG_META.map((meta) => {
                const value = form.featureFlags[meta.key] as boolean;
                return (
                  <div
                    key={meta.key}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/40 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
                        {meta.description}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          featureFlags: {
                            ...f.featureFlags,
                            [meta.key]: v,
                          },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-brand text-black hover:bg-brand/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
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
