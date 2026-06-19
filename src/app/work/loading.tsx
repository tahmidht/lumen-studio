import { CardGridSkeleton } from "@/components/site/skeletons";

export default function Loading() {
  return (
    <div className="border-b border-border py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-5 h-12 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
        <div className="mt-12">
          <CardGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
