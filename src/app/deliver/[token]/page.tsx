import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, Film, Lock, ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { DeliveryClient } from "@/components/site/delivery-client";
import type { Metadata } from "next";

export const revalidate = 0;

type Params = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const row = await db.deliveryToken.findUnique({ where: { token } });
  if (!row || row.revoked) return { title: "Delivery not found" };
  const project = await db.project.findUnique({
    where: { id: row.projectId },
    select: { title: true },
  });
  if (!project) return { title: "Delivery not found" };
  return {
    title: `${project.title} — Your films`,
    description: `Your delivered films for ${project.title}.`,
    robots: { index: false, follow: false }, // don't index client delivery pages
  };
}

export default async function DeliveryPage({ params }: Params) {
  const { token } = await params;
  const config = await getSiteConfig();

  const row = await db.deliveryToken.findUnique({ where: { token } });
  if (!row || row.revoked) notFound();

  const project = await db.project.findUnique({
    where: { id: row.projectId },
    select: {
      id: true,
      title: true,
      client: true,
      excerpt: true,
      thumbnail: true,
      posterImage: true,
    },
  });
  if (!project) notFound();

  if (row.expiresAt && row.expiresAt < new Date()) {
    return (
      <SiteShell config={config}>
        <section className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="max-w-md text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h1 className="mt-4 font-display text-2xl font-bold">Link expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This delivery link expired on{" "}
              {row.expiresAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Contact{" "}
              <a href={`mailto:${config.contactEmail}`} className="text-brand hover:underline">
                {config.contactEmail}
              </a>{" "}
              for a new link.
            </p>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell config={config}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden">
          {project.posterImage || project.thumbnail ? (
            <img
              src={project.posterImage || project.thumbnail!}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
        </div>

        <div className="relative -mt-32 pb-12">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-brand" />
              <span className="label-eyebrow text-brand">Your films are ready</span>
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
              {project.title}
            </h1>
            {project.excerpt && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
                {project.excerpt}
              </p>
            )}
            {project.client && (
              <p className="mt-3 text-sm text-muted-foreground">
                Prepared for{" "}
                <span className="font-medium text-foreground">{project.client}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Deliverables — client component handles passphrase + fetch */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <DeliveryClient token={token} requiresPassphrase={!!row.passphrase} />
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-border py-12">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground text-pretty">
              These download links are private — please don't share them publicly.
              Questions about your delivery? Reply to your original email or contact{" "}
              <a
                href={`mailto:${config.contactEmail}`}
                className="text-brand hover:underline"
              >
                {config.contactEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

void Film;
void Lock;
void ArrowLeft;
void Download;
