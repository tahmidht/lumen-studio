import { DashboardSkeleton } from "@/components/site/skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <main className="px-5 py-8 md:px-8 md:py-10">
        <DashboardSkeleton />
      </main>
    </div>
  );
}
