import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { BrandTheme } from "@/components/site/brand-theme";
import { PageTransition } from "@/components/site/page-transition";
import { SearchPalette } from "@/components/site/search-palette";
import { BackToTop } from "@/components/site/back-to-top";
import { CinematicLoader } from "@/components/site/cinematic-loader";
import { CustomCursor } from "@/components/site/custom-cursor";
import { ShowreelModal } from "@/components/site/showreel-modal";
import { CookieConsent } from "@/components/site/cookie-consent";
import type { SiteConfig } from "@/lib/types";
import type { CursorMode } from "@/lib/feature-flags";

/**
 * Public site shell: fixed navbar + sticky footer + brand theme injection.
 * Reads admin-configurable feature flags and conditionally renders each
 * premium UX feature (cursor, loader, magnetic, etc.). Used by every
 * public-facing page.
 */
export function SiteShell({
  config,
  children,
}: {
  config: SiteConfig;
  children: React.ReactNode;
}) {
  const flags = config.featureFlags;
  const cursorMode: CursorMode = flags?.cursorMode ?? "magnetic";

  return (
    <div className="relative flex min-h-screen flex-col bg-cinema">
      <BrandTheme accent={config.accentColor} />
      {cursorMode !== "none" && (
        <CustomCursor mode={cursorMode} />
      )}
      {flags?.cinematicLoader && (
        <CinematicLoader siteName={config.siteName} />
      )}
      <Navbar
        siteName={config.siteName}
        showScrollProgress={flags?.scrollProgress ?? true}
      />
      <SearchPalette />
      <ShowreelModal />
      <main className="flex-1 pt-16 md:pt-20">
        {flags?.pageTransitions ? (
          <PageTransition>{children}</PageTransition>
        ) : (
          children
        )}
      </main>
      <Footer config={config} />
      {flags?.backToTop && <BackToTop />}
      <CookieConsent />
    </div>
  );
}
