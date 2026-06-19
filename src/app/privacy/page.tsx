import Link from "next/link";
import { ArrowLeft, Shield, Mail, Cookie, FileText, Eye, Phone, MapPin, Sparkles, Camera } from "lucide-react";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { JsonLd } from "@/components/site/json-ld";

export const revalidate = 60;

export const metadata = {
  title: "Privacy Notice",
  description:
    "How this studio collects, uses, and protects your personal data.",
};

export default async function PrivacyPage() {
  const config = await getSiteConfig();
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const privacyLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Notice",
    description: "Data collection and privacy practices.",
    url: `${process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://lumen.studio"}/privacy`,
    publisher: { "@type": "Organization", name: config.siteName },
  };

  const sections = [
    {
      icon: Eye,
      title: "What we collect",
      body: [
        "Contact form inquiries: your name, email, phone (optional), project type, budget, event date, and message.",
        "Newsletter signups: your email address only.",
        "Anonymous analytics: which pages are visited and general region — no personally identifying data.",
      ],
    },
    {
      icon: Mail,
      title: "How we use it",
      body: [
        `Responding to your inquiry and discussing your project.`,
        "Sending occasional studio updates and new-work announcements (only if you subscribed).",
        "Improving the site based on aggregate usage patterns.",
        "We never sell or rent your data to third parties.",
      ],
    },
    {
      icon: Cookie,
      title: "Cookies",
      body: [
        "Essential cookies keep the site working (theme preference, session).",
        "Analytics cookies (if you accept) help us understand what's useful.",
        "You can decline non-essential cookies from the banner at the bottom of the page.",
      ],
    },
    {
      icon: Shield,
      title: "Your rights",
      body: [
        "Request a copy of the data we hold about you.",
        "Ask us to correct or delete your data.",
        "Unsubscribe from the newsletter at any time (link in every email).",
        `Contact us at ${config.contactEmail} to exercise any of these rights.`,
      ],
    },
    {
      icon: FileText,
      title: "Data retention",
      body: [
        "Inquiries are kept for as long as needed to serve your project, then archived.",
        "Newsletter subscriptions remain until you unsubscribe or request deletion.",
        "We do not store payment details — billing is handled by trusted third parties.",
      ],
    },
    {
      icon: Sparkles,
      title: "AI features",
      body: [
        "When the studio admin uses AI-assist features (e.g. drafting a reply, writing a description, generating alt-text), the relevant content is sent to Google's Gemini API for processing.",
        "This includes: inquiry text, project details, and uploaded images (for alt-text generation only).",
        "AI-generated content is always reviewed by the admin before being published or sent.",
        "We do not use AI features on sensitive or confidential client data without explicit consent.",
        "Delivery pages (/deliver/[token]) are private — only someone with the link (and optional passphrase) can view them.",
      ],
    },
    {
      icon: Camera,
      title: "Face-match photo delivery",
      body: [
        "When the studio uploads event photos, face detection runs entirely in the admin's browser — no face data is sent to any external service.",
        "Face descriptors (tiny mathematical representations, not actual photos) are stored on our server to enable matching.",
        "When you (the client) take a selfie or upload a photo to find your pictures, the face detection also runs in your browser — your selfie photo is never uploaded or stored.",
        "Only the 128-dimensional descriptor (a list of numbers) is sent to our server for matching against the stored descriptors.",
        "We cannot reconstruct your face from the descriptor. The descriptor is specific to this photo batch and is deleted when the batch is deleted.",
        "Photo delivery links (/p/[token]) are private — only someone with the link can access them.",
      ],
    },
  ];

  return (
    <SiteShell config={config}>
      <JsonLd data={privacyLd} />
      {/* Hero */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-brand hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Legal</span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
            Privacy Notice
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Your trust matters. This notice explains what data we collect, why,
            and the rights you have over it.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Last updated {lastUpdated}
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="space-y-8">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-xl font-semibold">
                      {s.title}
                    </h2>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {s.body.map((line, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-sm leading-relaxed text-muted-foreground text-pretty"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Contact */}
          <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center md:p-8">
            <h2 className="font-display text-lg font-semibold">
              Questions about your data?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              We're happy to help. Reach out anytime.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Contact the studio
            </Link>
          </div>

          {/* Direct contact channels — pulled from site config */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {config.contactEmail && (
              <a
                href={`mailto:${config.contactEmail}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-brand/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </span>
                <span className="break-all text-sm text-foreground group-hover:text-brand">
                  {config.contactEmail}
                </span>
              </a>
            )}
            {config.contactPhone && (
              <a
                href={`tel:${config.contactPhone.replace(/[^+\d]/g, "")}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-brand/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone
                </span>
                <span className="text-sm text-foreground group-hover:text-brand">
                  {config.contactPhone}
                </span>
              </a>
            )}
            {config.contactLocation && (
              <div className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Studio
                </span>
                <span className="text-sm text-foreground">{config.contactLocation}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
