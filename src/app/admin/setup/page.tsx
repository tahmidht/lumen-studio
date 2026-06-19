import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BrandTheme } from "@/components/site/brand-theme";
import { SetupWizardForm } from "@/components/admin/setup-wizard-form";
import { getSiteConfig } from "@/lib/settings";

export const metadata = { title: "Setup" };

export default async function SetupPage() {
  const session = await getServerSession(authOptions);
  // Only show the wizard to authenticated admins who must change their password
  if (!session) {
    redirect("/admin/login");
  }
  if (!(session.user as { mustChangePassword?: boolean }).mustChangePassword) {
    redirect("/admin");
  }
  const config = await getSiteConfig();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <BrandTheme accent={config.accentColor} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]" />
      </div>
      <div className="absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />

      <div className="relative z-10 w-full max-w-md px-5">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="font-display text-lg font-bold tracking-[0.2em]">
              {config.siteName}
            </span>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-brand">
            First-run setup
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold">
              Secure your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              This is your first login. Please set a new password to replace the
              default before continuing.
            </p>
          </div>
          <SetupWizardForm defaultEmail={session.user?.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
