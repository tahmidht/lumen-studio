import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { ServicesSection } from "@/components/site/services-section";
import { ProcessSection } from "@/components/site/process-section";
import { ProcessGallery } from "@/components/site/process-gallery";
import { FaqSection } from "@/components/site/faq-section";
import { ContactCTA } from "@/components/site/contact-cta";
import { parseJsonArray } from "@/lib/api";
import type { Service, Faq, ProcessStep } from "@/lib/types";

export const revalidate = 60;

export default async function ServicesPage() {
  const [config, rows, faqRows, processRows] = await Promise.all([
    getSiteConfig(),
    db.service.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
    db.faq.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    db.processStep.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);
  const services: Service[] = rows.map((s) => ({
    ...s,
    features: parseJsonArray(s.features),
  }));
  const faqs: Faq[] = faqRows.map((f) => ({ ...f }));
  const processSteps: ProcessStep[] = processRows.map((p) => ({ ...p }));

  return (
    <SiteShell config={config}>
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Services</span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
            Cinematic craft, end to end
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            From a single gimbal day to a fully produced brand film — pick a
            service or combine them into a complete production.
          </p>
        </div>
      </section>

      <ServicesSection services={services} />
      {processSteps.length > 0 ? (
        <ProcessGallery
          steps={processSteps}
          revealEnabled={config.featureFlags?.imageReveal ?? true}
        />
      ) : (
        <ProcessSection />
      )}
      <FaqSection faqs={faqs} />
      <ContactCTA config={config} />
    </SiteShell>
  );
}
