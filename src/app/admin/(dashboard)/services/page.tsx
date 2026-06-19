import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { db } from "@/lib/db";
import { parseJsonArray } from "@/lib/api";
import { AdminHeader } from "@/components/admin/sidebar";
import { Card } from "@/components/ui/card";
import { ServicesManager } from "@/components/admin/services-manager";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const rows = await db.service.findMany({ orderBy: { order: "asc" } });

  if (rows.length === 0) {
    return (
      <div className="space-y-8">
        <AdminHeader
          title="Services"
          description="The offerings shown in your Services section."
          action={
            <Link
              href="/admin/services/new"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              New Service
            </Link>
          }
        />
        <Card className="flex flex-col items-center gap-3 border-dashed py-20 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-lg font-semibold">No services yet</p>
        </Card>
      </div>
    );
  }

  const services: Service[] = rows.map((s) => ({
    ...s,
    features: parseJsonArray(s.features),
  }));

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Services"
        description="The offerings shown in your Services section. Toggle to Reorder mode to drag-arrange them."
        action={
          <Link
            href="/admin/services/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Service
          </Link>
        }
      />
      <ServicesManager services={services} />
    </div>
  );
}
