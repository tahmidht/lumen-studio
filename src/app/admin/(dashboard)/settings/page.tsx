import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/sidebar";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [config, projectRows] = await Promise.all([
    getSiteConfig(),
    db.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: { id: true, title: true, slug: true, published: true, category: true },
    }),
  ]);
  const projects = projectRows.map((p) => ({ ...p }));
  return (
    <div className="space-y-8">
      <AdminHeader
        title="Settings"
        description="Control your brand, hero, contact details, social links, accent color, and homepage banner."
      />
      <SettingsForm config={config} projects={projects} />
    </div>
  );
}
