import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { BrandTheme } from "@/components/site/brand-theme";
import { DEFAULT_CONFIG } from "@/lib/settings";

export const metadata = { title: "404 — Lost in the frame" };

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cinema px-5 text-center">
      <BrandTheme accent={DEFAULT_CONFIG.accentColor} />

      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]" />
      </div>
      <div className="absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />

      {/* Letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[6vh] bg-black/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[6vh] bg-black/90" />

      <div className="relative z-10 max-w-lg">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-brand" />
          <span className="label-eyebrow text-brand">Error 404</span>
          <span className="h-px w-10 bg-brand" />
        </div>

        <h1 className="mt-6 font-display text-[7rem] font-bold leading-none tracking-tight text-balance md:text-[10rem]">
          <span className="bg-gradient-to-b from-foreground to-foreground/30 bg-clip-text text-transparent">
            404
          </span>
        </h1>

        <h2 className="mt-2 font-display text-2xl font-bold leading-tight md:text-3xl">
          Lost in the frame
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
          The scene you're looking for has been cut from the final edit — or
          never existed at all. Let's get you back to the story.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-black transition-all hover:brightness-110"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-7 py-3.5 text-sm font-medium backdrop-blur-sm transition-all hover:border-brand hover:text-brand"
          >
            <Compass className="h-4 w-4" />
            Browse Portfolio
          </Link>
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {DEFAULT_CONFIG.siteName}
        </Link>
      </div>
    </div>
  );
}
