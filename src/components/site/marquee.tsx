import { categoryLabel } from "@/lib/constants";

const ITEMS = [
  "WEDDING",
  "COMMERCIAL",
  "DOCUMENTARY",
  "MUSIC_VIDEO",
  "TRAVEL",
  "BRAND",
  "EVENT",
  "FILM",
];

/** Infinite scrolling category marquee — adds motion and rhythm to the page. */
export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section
      aria-hidden
      className="relative border-y border-border bg-card/30 py-5 overflow-hidden"
    >
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {row.map((item, i) => (
          <div key={i} className="flex items-center gap-10">
            <span className="font-display text-2xl font-medium tracking-tight text-foreground/70">
              {categoryLabel(item)}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          </div>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </section>
  );
}
