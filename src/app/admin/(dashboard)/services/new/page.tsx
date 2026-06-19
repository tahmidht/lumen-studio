import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/sidebar";
import { ServiceForm } from "@/components/admin/service-form";

export default function NewServicePage() {
  return (
    <div className="space-y-8">
      <Link href="/admin/services" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to services
      </Link>
      <AdminHeader title="New Service" description="Add a new offering." />
      <ServiceForm isNew />
    </div>
  );
}
