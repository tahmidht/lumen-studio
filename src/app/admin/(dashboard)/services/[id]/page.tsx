import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { parseJsonArray } from "@/lib/api";
import { AdminHeader } from "@/components/admin/sidebar";
import { ServiceForm } from "@/components/admin/service-form";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await db.service.findUnique({ where: { id } });
  if (!row) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/services" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </Link>
        <DeleteButton endpoint={`/api/services/${row.id}`} redirectTo="/admin/services" />
      </div>
      <AdminHeader title="Edit Service" description={row.title} />
      <ServiceForm
        initial={{
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description,
          icon: row.icon ?? "Camera",
          features: parseJsonArray(row.features),
          priceFrom: row.priceFrom ?? "",
          order: row.order,
          published: row.published,
        }}
      />
    </div>
  );
}
