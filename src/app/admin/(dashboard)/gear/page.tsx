import Link from "next/link";
import { Plus, Camera } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { Card } from "@/components/ui/card";
import { GearManager } from "@/components/admin/gear-manager";
import type { Gear } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminGearPage() {
  const rows = await db.gear.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  if (rows.length === 0) {
    return (
      <div className="space-y-8">
        <AdminHeader
          title="Gear"
          description="The equipment shown in your Gear section."
          action={
            <Link
              href="/admin/gear/new"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Add Gear
            </Link>
          }
        />
        <Card className="flex flex-col items-center gap-3 border-dashed py-20 text-center">
          <Camera className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-lg font-semibold">No gear yet</p>
        </Card>
      </div>
    );
  }

  const gear: Gear[] = rows.map((g) => ({ ...g }));

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Gear"
        description="The equipment shown in your Gear section. Toggle to Reorder mode to drag-arrange items."
        action={
          <Link
            href="/admin/gear/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add Gear
          </Link>
        }
      />
      <GearManager gear={gear} />
    </div>
  );
}
