import { getSiteConfig } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/sidebar";
import { AboutForm } from "@/components/admin/about-form";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const config = await getSiteConfig();
  return (
    <div className="space-y-8">
      <AdminHeader title="About" description="The bio, stats, and skills shown in your About section." />
      <AboutForm config={config} />
    </div>
  );
}
