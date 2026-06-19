import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { InquiryDetail } from "@/components/admin/inquiry-detail";
import { InquiryStarButton } from "@/components/admin/inquiry-star-button";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.inquiry.findUnique({ where: { id } });
  if (!row) notFound();
  // mark as read (the GET api does this too, but do it here for direct nav)
  if (row.status === "NEW") {
    await db.inquiry.update({ where: { id }, data: { status: "READ" } });
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/inquiries" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to inquiries
      </Link>
      <AdminHeader
        title={row.name}
        description={row.email}
        action={<InquiryStarButton inquiryId={row.id} starred={row.starred} withLabel />}
      />
      <InquiryDetail inquiry={row} />
    </div>
  );
}
