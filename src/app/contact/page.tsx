import { Mail, Phone, MapPin, Clock, Instagram, Youtube, Linkedin } from "lucide-react";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { ContactForm } from "@/components/site/contact-form";

export const revalidate = 60;

export default async function ContactPage() {
  const config = await getSiteConfig();

  const channels = [
    config.contactEmail && { icon: Mail, label: "Email", value: config.contactEmail, href: `mailto:${config.contactEmail}` },
    config.contactPhone && { icon: Phone, label: "Phone", value: config.contactPhone, href: `tel:${config.contactPhone}` },
    config.contactLocation && { icon: MapPin, label: "Location", value: config.contactLocation },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <SiteShell config={config}>
      <section className="border-b border-border py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Contact</span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl">
            Let's make something worth watching
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Tell me about your project. I read every message and reply within 24
            hours.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5">
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">Direct channels</h3>
                  <div className="mt-5 space-y-4">
                    {channels.map((c) => {
                      const Icon = c.icon;
                      return (
                        <div key={c.label} className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                            {c.href ? (
                              <a href={c.href} className="text-sm hover:text-brand">{c.value}</a>
                            ) : (
                              <p className="text-sm">{c.value}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                        <Clock className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Response time</p>
                        <p className="text-sm">Within 24 hours, usually much faster</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">Find me online</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {config.socialInstagram && (
                      <SocialLink href={config.socialInstagram} icon={<Instagram className="h-4 w-4" />} label="Instagram" />
                    )}
                    {config.socialYoutube && (
                      <SocialLink href={config.socialYoutube} icon={<Youtube className="h-4 w-4" />} label="YouTube" />
                    )}
                    {config.socialVimeo && (
                      <SocialLink href={config.socialVimeo} icon={<Youtube className="h-4 w-4" />} label="Vimeo" />
                    )}
                    {config.socialLinkedin && (
                      <SocialLink href={config.socialLinkedin} icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    Booking 2–3 months out for weddings, 4–6 weeks for commercial
                    work. Rush slots occasionally available — just ask.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-brand hover:text-brand"
    >
      {icon}
      {label}
    </a>
  );
}
