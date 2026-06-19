import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { FaqForm } from "@/components/admin/faq-form";

export const dynamic = "force-dynamic";

export default async function AdminFaqEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = await db.faq.findUnique({ where: { id } });
  if (!faq) return notFound();

  return (
    <div className="space-y-8">
      <AdminHeader title="Edit FAQ" description={faq.question} />
      <FaqForm initial={{ ...faq }} />
    </div>
  );
}
