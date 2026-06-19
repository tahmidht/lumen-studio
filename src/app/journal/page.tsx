import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { parseJsonArray } from "@/lib/api";
import { JournalSection } from "@/components/site/journal-section";
import { ContactCTA } from "@/components/site/contact-cta";
import type { BlogPost } from "@/lib/types";

export const revalidate = 60;

export default async function JournalPage() {
  const [config, rows] = await Promise.all([
    getSiteConfig(),
    db.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);
  const posts: BlogPost[] = rows.map((p) => ({
    ...p,
    tags: parseJsonArray(p.tags),
  }));

  return (
    <SiteShell config={config}>
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Journal</span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
            Behind the scenes
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Notes from the field — process, gear, and the craft of cinematic
            storytelling.
          </p>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="py-24 text-center">
          <p className="text-muted-foreground">No stories published yet. Check back soon.</p>
        </section>
      ) : (
        <JournalSection posts={posts} />
      )}
      <ContactCTA config={config} />
    </SiteShell>
  );
}
