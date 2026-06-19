import { Suspense } from "react";
import Link from "next/link";
import { BrandTheme } from "@/components/site/brand-theme";
import { LoginForm } from "@/components/admin/login-form";
import { getSiteConfig } from "@/lib/settings";

export const metadata = { title: "Admin Sign In" };

export default async function AdminLoginPage() {
  const config = await getSiteConfig();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <BrandTheme accent={config.accentColor} />
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]" />
      </div>
      <div className="absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-5">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand" />
          <span className="font-display text-lg font-bold tracking-[0.2em]">
            {config.siteName}
          </span>
        </Link>
        <div className="w-full rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold">Studio Control</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage your portfolio.
            </p>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
        <Link
          href="/"
          className="mt-6 text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
