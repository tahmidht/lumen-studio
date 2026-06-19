import { HeroSkeleton } from "@/components/site/skeletons";

export default function Loading() {
  return (
    <div className="relative flex min-h-screen flex-col bg-cinema">
      <div className="h-20" />
      <HeroSkeleton />
    </div>
  );
}
