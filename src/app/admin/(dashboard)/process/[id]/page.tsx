import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { ProcessStepForm } from "@/components/admin/process-step-form";

export const dynamic = "force-dynamic";

export default async function AdminProcessEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await db.processStep.findUnique({ where: { id } });
  if (!row) return notFound();

  return (
    <div className="space-y-8">
      <AdminHeader title="Edit Process Step" description={row.title} />
      <ProcessStepForm
        initial={{
          id: row.id,
          title: row.title,
          description: row.description,
          image: row.image ?? "",
          imageAlt: row.imageAlt ?? "",
          phase: row.phase ?? "",
          order: row.order,
          published: row.published,
        }}
      />
    </div>
  );
}
