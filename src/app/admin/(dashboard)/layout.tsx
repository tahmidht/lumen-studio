import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteConfig } from "@/lib/settings";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminKeyboardShortcuts } from "@/components/admin/keyboard-shortcuts";
import { BrandTheme } from "@/components/site/brand-theme";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const config = await getSiteConfig();

  // First-run setup: if the admin must change their password, redirect to the wizard.
  if ((session.user as { mustChangePassword?: boolean }).mustChangePassword) {
    redirect("/admin/setup");
  }

  return (
    <div className="min-h-screen bg-background">
      <BrandTheme accent={config.accentColor} />
      <AdminSidebar siteName={config.siteName} />
      <div className="lg:pl-64">
        <main className="min-h-screen px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
      <AdminKeyboardShortcuts />
    </div>
  );
}

// keep authOptions import referenced for type augmentation
void authOptions;
