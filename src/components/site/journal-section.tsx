"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { SectionHeader } from "@/components/site/featured-work";
import { readingTimeLabel } from "@/lib/reading";
import { RevealImage } from "@/components/site/reveal-image";

function formatDate(d: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function JournalSection({
  posts,
  revealEnabled = true,
}: {
  posts: BlogPost[];
  revealEnabled?: boolean;
}) {
  if (!posts.length) return null;
  const [lead, ...rest] = posts.slice(0, 4);
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Journal"
          title="Behind the scenes"
          description="Notes from the field — process, gear, and the craft of cinematic storytelling."
          action={
            <Link
              href="/journal"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand"
            >
              All stories
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Lead post */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={`/journal/${lead.slug}`} className="group block h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {lead.coverImage ? (
                    <RevealImage
                      className="absolute inset-0 h-full w-full"
                      enabled={revealEnabled}
                    >
                      <img
                        src={lead.coverImage}
                        alt={lead.coverImageAlt || lead.title}
                        className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                      />
                    </RevealImage>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/40" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(lead.publishedAt ?? lead.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand" />
                      {readingTimeLabel(lead.content)}
                    </span>
                    {lead.tags[0] && (
                      <span className="rounded-full border border-border px-2 py-0.5">
                        {lead.tags[0]}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold leading-tight">
                    {lead.title}
                  </h3>
                  {lead.excerpt && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                      {lead.excerpt}
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    Read story
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </article>
            </Link>
          </motion.div>

          {/* Smaller posts */}
          <div className="flex flex-col gap-6">
            {rest.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link href={`/journal/${p.slug}`} className="group block">
                  <article className="flex gap-5 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-card/60">
                    <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg">
                      {p.coverImage ? (
                         
                        <img
                          src={p.coverImage}
                          alt={p.coverImageAlt || p.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-teal-950/40" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {formatDate(p.publishedAt ?? p.createdAt)}
                      </span>
                      <h4 className="mt-1.5 font-display text-lg font-semibold leading-snug">
                        {p.title}
                      </h4>
                      {p.excerpt && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                          {p.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
