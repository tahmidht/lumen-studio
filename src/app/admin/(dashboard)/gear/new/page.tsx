import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/sidebar";
import { GearForm } from "@/components/admin/gear-form";

export default function NewGearPage() {
  return (
    <div className="space-y-8">
      <Link href="/admin/gear" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to gear
      </Link>
      <AdminHeader title="Add Gear" />
      <GearForm isNew />
    </div>
  );
}
