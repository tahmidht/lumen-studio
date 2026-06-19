import Link from "next/link";
import { ArrowUpRight, Award, Globe2, Camera, Film } from "lucide-react";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { GearSection } from "@/components/site/gear-section";
import { FaqSection } from "@/components/site/faq-section";
import { ProcessGallery } from "@/components/site/process-gallery";
import { ProcessSection } from "@/components/site/process-section";
import { parseJsonArray } from "@/lib/api";
import type { Gear, Testimonial, Faq, ProcessStep } from "@/lib/types";

export const revalidate = 60;

export default async function AboutPage() {
  const [config, gearRows, tRows, faqRows, processRows] = await Promise.all([
    getSiteConfig(),
    db.gear.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] }),
    db.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
    db.faq.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
    db.processStep.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);
  const gear: Gear[] = gearRows.map((g) => ({ ...g }));
  const testimonials: Testimonial[] = tRows.map((t) => ({ ...t }));
  const faqs: Faq[] = faqRows.map((f) => ({ ...f }));
  const processSteps: ProcessStep[] = processRows.map((p) => ({ ...p }));

  return (
    <SiteShell config={config}>
      {/* Hero */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <div className="frame-cinema relative w-full">
                  {config.aboutImage ? (
                     
                    <img src={config.aboutImage} alt="Cinematographer" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand" />
                <span className="label-eyebrow text-brand">Behind the Lens</span>
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
                {config.siteName}
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
                {config.aboutBio}
              </p>

              {config.aboutStats.length > 0 && (
                <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
                  {config.aboutStats.map((s) => (
                    <div key={s.label} className="bg-card p-5">
                      <p className="font-display text-3xl font-bold text-brand">{s.value}</p>
                      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {config.aboutSkills.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {config.aboutSkills.map((skill) => (
                    <span key={skill} className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Camera, title: "Story-First", desc: "Every shot serves the story. Gear is a means, never the message." },
              { icon: Globe2, title: "Globally Mobile", desc: "Based in one city, shooting everywhere. Passports current, kit flight-ready." },
              { icon: Award, title: "Award-Minded", desc: "Work built to be remembered — and occasionally, to be shortlisted." },
            ].map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="rounded-xl border border-border bg-card p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <GearSection gear={gear} />

      {/* Behind-the-Scenes process gallery (DB-managed, falls back to static) */}
      {processSteps.length > 0 ? (
        <ProcessGallery
          steps={processSteps}
          revealEnabled={config.featureFlags?.imageReveal ?? true}
        />
      ) : (
        <ProcessSection />
      )}

      <TestimonialsSection
        testimonials={testimonials}
        autoplay={config.featureFlags?.testimonialAutoplay ?? true}
      />
      <FaqSection faqs={faqs} />

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Let's Talk</span>
            <span className="h-px w-10 bg-brand" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight text-balance md:text-5xl">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground text-pretty">
            I'd love to hear what you're building. Let's make something worth watching.
          </p>
          <Link href="/contact" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-semibold text-black transition-all hover:brightness-110">
            <Film className="h-4 w-4" />
            Start a Project
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
