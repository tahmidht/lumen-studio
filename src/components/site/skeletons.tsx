/**
 * Branded loading skeletons for the public site + admin.
 * Uses the brand shimmer animation defined in globals.css.
 */

export function HeroSkeleton() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-background to-teal-950/30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[4.5vh] bg-black/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[4.5vh] bg-black/90" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 md:px-8 md:pb-28">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-16 w-3/4 animate-pulse rounded-lg bg-muted md:w-2/3" />
        <div className="mt-3 h-16 w-1/2 animate-pulse rounded-lg bg-muted" />
        <div className="mt-7 h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
        <div className="mt-10 flex gap-4">
          <div className="h-11 w-40 animate-pulse rounded-full bg-muted" />
          <div className="h-11 w-32 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </section>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
