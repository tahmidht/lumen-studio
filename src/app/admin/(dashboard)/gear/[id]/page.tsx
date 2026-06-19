import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { GearForm } from "@/components/admin/gear-form";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function EditGearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.gear.findUnique({ where: { id } });
  if (!row) notFound();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/gear" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to gear
        </Link>
        <DeleteButton endpoint={`/api/gear/${row.id}`} redirectTo="/admin/gear" />
      </div>
      <AdminHeader title="Edit Gear" description={row.name} />
      <GearForm
        initial={{
          id: row.id,
          name: row.name,
          category: row.category,
          brand: row.brand ?? "",
          description: row.description ?? "",
          image: row.image ?? "",
          order: row.order,
        }}
      />
    </div>
  );
}
