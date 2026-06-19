import { Award as AwardIcon } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { Card } from "@/components/ui/card";
import { AwardsManager } from "@/components/admin/awards-manager";
import type { Award } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAwardsPage() {
  const rows = await db.award.findMany({ orderBy: { order: "asc" } });

  if (rows.length === 0) {
    return (
      <div className="space-y-8">
        <AdminHeader
          title="Awards"
          description="Recognitions shown in the homepage awards strip."
        />
        <AwardsManager awards={[]} />
      </div>
    );
  }

  const awards: Award[] = rows.map((r) => ({ ...r }));

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Awards"
        description="Recognitions shown in the homepage awards strip. Toggle to Reorder mode to drag-arrange them."
      />
      <AwardsManager awards={awards} />
    </div>
  );
}

void Card;
void AwardIcon;
