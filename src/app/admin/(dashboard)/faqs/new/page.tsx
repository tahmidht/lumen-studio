import { AdminHeader } from "@/components/admin/sidebar";
import { FaqForm } from "@/components/admin/faq-form";

export const dynamic = "force-dynamic";

export default function AdminFaqNewPage() {
  return (
    <div className="space-y-8">
      <AdminHeader title="New FAQ" description="Answer a question your clients keep asking." />
      <FaqForm isNew />
    </div>
  );
}
