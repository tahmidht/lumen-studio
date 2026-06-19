import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { ProcessStepsManager } from "@/components/admin/process-steps-manager";
import { Button } from "@/components/ui/button";
import type { ProcessStep } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProcessPage() {
  const rows = await db.processStep.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  const steps: ProcessStep[] = rows.map((r) => ({ ...r }));
  const published = steps.filter((s) => s.published).length;

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Process Steps"
        description={
          steps.length > 0
            ? `${published} published of ${steps.length} total. Shown as a cinematic gallery on the homepage, /services, and /about.`
            : "Tell the story of how a film comes to life — discovery, shoot day, edit, color grade, delivery."
        }
        action={
          <Button asChild className="bg-brand text-black hover:bg-brand/90">
            <Link href="/admin/process/new">
              <Plus className="mr-2 h-4 w-4" />
              New step
            </Link>
          </Button>
        }
      />
      <ProcessStepsManager steps={steps} />
    </div>
  );
}
