import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.testimonial.findUnique({ where: { id } });
  if (!row) notFound();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/testimonials" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to testimonials
        </Link>
        <DeleteButton endpoint={`/api/testimonials/${row.id}`} redirectTo="/admin/testimonials" />
      </div>
      <AdminHeader title="Edit Testimonial" description={row.name} />
      <TestimonialForm
        initial={{
          id: row.id,
          name: row.name,
          role: row.role ?? "",
          company: row.company ?? "",
          content: row.content,
          rating: row.rating,
          avatar: row.avatar ?? "",
          order: row.order,
          published: row.published,
        }}
      />
    </div>
  );
}
