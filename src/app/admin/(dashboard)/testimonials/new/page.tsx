import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/sidebar";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-8">
      <Link href="/admin/testimonials" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to testimonials
      </Link>
      <AdminHeader title="New Testimonial" />
      <TestimonialForm isNew />
    </div>
  );
}
