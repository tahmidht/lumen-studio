import { db } from "@/lib/db";
import { Award, Star } from "lucide-react";
import type { Award as AwardType } from "@/lib/types";

/**
 * Awards & recognition strip — a credibility band on the homepage.
 * Reads published awards from the DB (admin-configurable). Falls back to
 * an empty state if none exist.
 */
export async function AwardsStrip() {
  const rows = await db.award.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  const awards: AwardType[] = rows.map((r) => ({ ...r }));

  return (
    <section className="relative border-y border-border bg-card/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-brand" />
            <span className="label-eyebrow text-brand">Recognition</span>
            <span className="h-px w-8 bg-brand" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Awarded &amp; featured
          </h2>
        </div>

        {awards.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
            {awards.map((r) => (
              <div
                key={r.id}
                className="group relative flex flex-col items-center gap-2 bg-card p-6 text-center transition-colors hover:bg-card/60"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand transition-transform duration-300 group-hover:scale-110">
                  <Award className="h-4 w-4" />
                </span>
                <p className="font-display text-sm font-semibold leading-tight">
                  {r.label}
                </p>
                {r.note && (
                  <p className="text-xs text-muted-foreground">{r.note}</p>
                )}
                {r.year && (
                  <p className="mt-0.5 font-mono text-[10px] text-brand/70">
                    {r.year}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No awards published yet.
          </div>
        )}

        {/* rating line */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="flex">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star key={idx} className="h-3.5 w-3.5 fill-brand text-brand" />
            ))}
          </span>
          <span>Rated 5.0 by 120+ clients worldwide</span>
        </div>
      </div>
    </section>
  );
}
