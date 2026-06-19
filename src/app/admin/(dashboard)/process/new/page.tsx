import { AdminHeader } from "@/components/admin/sidebar";
import { ProcessStepForm } from "@/components/admin/process-step-form";

export const dynamic = "force-dynamic";

export default function AdminProcessNewPage() {
  return (
    <div className="space-y-8">
      <AdminHeader
        title="New Process Step"
        description="Add a stage to your behind-the-scenes story."
      />
      <ProcessStepForm isNew />
    </div>
  );
}
