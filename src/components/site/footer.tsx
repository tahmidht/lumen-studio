import Link from "next/link";
import { Instagram, Youtube, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import type { SiteConfig } from "@/lib/types";
import { NewsletterForm } from "@/components/site/newsletter-form";

export function Footer({ config }: { config: SiteConfig }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              <span className="font-display text-xl font-bold tracking-[0.2em]">
                {config.siteName}
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
              {config.siteDescription || config.siteTagline}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {config.socialInstagram && (
                <SocialIcon href={config.socialInstagram} label="Instagram">
                  <Instagram className="h-4 w-4" />
                </SocialIcon>
              )}
              {config.socialYoutube && (
                <SocialIcon href={config.socialYoutube} label="YouTube">
                  <Youtube className="h-4 w-4" />
                </SocialIcon>
              )}
              {config.socialLinkedin && (
                <SocialIcon href={config.socialLinkedin} label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </SocialIcon>
              )}
              {config.contactEmail && (
                <SocialIcon href={`mailto:${config.contactEmail}`} label="Email">
                  <Mail className="h-4 w-4" />
                </SocialIcon>
              )}
            </div>

            {/* Newsletter signup */}
            <div className="mt-8">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Field notes — straight to your inbox
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Sitemap */}
          <div className="md:col-span-3">
            <p className="label-eyebrow text-brand">Explore</p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { href: "/work", label: "Portfolio" },
                { href: "/services", label: "Services" },
                { href: "/about", label: "About" },
                { href: "/journal", label: "Journal" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-underline text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="label-eyebrow text-brand">Get in touch</p>
            <ul className="mt-5 space-y-3 text-sm">
              {config.contactEmail && (
                <li>
                  <a
                    href={`mailto:${config.contactEmail}`}
                    className="link-underline text-muted-foreground hover:text-foreground"
                  >
                    {config.contactEmail}
                  </a>
                </li>
              )}
              {config.contactPhone && (
                <li className="text-muted-foreground">{config.contactPhone}</li>
              )}
              {config.contactLocation && (
                <li className="text-muted-foreground">{config.contactLocation}</li>
              )}
            </ul>
            <Link
              href="/contact"
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand"
            >
              Start a project
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>
            © {year} {config.siteName}. {config.footerNote || "All rights reserved."}
          </p>
          <div className="flex items-center gap-6">
            <span>
              Developed by{" "}
              <a
                href="https://github.com/sharif418"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Sharif Mohammad Nasrullah
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-brand hover:bg-brand hover:text-black"
    >
      {children}
    </a>
  );
}
