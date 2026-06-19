"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Play, ChevronDown } from "lucide-react";
import type { SiteConfig } from "@/lib/types";
import { Magnetic } from "@/components/site/magnetic";

export function Hero({ config }: { config: SiteConfig }) {
  const hasPoster = !!config.heroPosterImage;
  const parallaxOn = config.featureFlags?.heroParallax ?? true;
  const magneticOn = config.featureFlags?.magneticButtons ?? true;
  const { scrollY } = useScroll();
  // parallax: background drifts up slower than content; content fades + rises
  const bgY = useTransform(scrollY, [0, 600], [0, 120]);
  const contentY = useTransform(scrollY, [0, 500], [0, 80]);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        style={parallaxOn ? { y: bgY } : undefined}
      >
        {hasPoster ? (
          <img
            src={config.heroPosterImage}
            alt=""
            className="h-[115%] w-full object-cover animate-ken-burns"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-950/40 via-background to-teal-950/30" />
        )}
        {/* Cinematic overlays — smooth gradient fades, not hard black bars */}
        {/* Top fade: blends hero into the navbar seamlessly */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/60 to-transparent" />
        {/* Bottom fade: blends hero into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/70 to-transparent" />
        {/* Left vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
        {/* Right vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-l from-background/40 via-transparent to-transparent" />
        {/* Subtle center vignette for cinematic focus */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
        {/* Film grain */}
        <div className="absolute inset-0 bg-grain opacity-[0.07] mix-blend-overlay" />
      </motion.div>

      {/* Cinematic frame edge — thin brand accent lines (not thick black bars) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 md:px-8 md:pb-28"
        style={parallaxOn ? { y: contentY, opacity: contentOpacity } : undefined}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">
              {config.siteTagline}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="mt-6 font-display text-[2.75rem] font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            {config.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg"
          >
            {config.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            {magneticOn ? (
              <Magnetic>
                <Link
                  href="/work"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-black transition-all hover:brightness-110"
                >
                  Explore the Work
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>
            ) : (
              <Link
                href="/work"
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-black transition-all hover:brightness-110"
              >
                Explore the Work
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
            {config.showreelUrl ? (
              <ShowreelButton url={config.showreelUrl} />
            ) : (
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-7 py-3.5 text-sm font-medium backdrop-blur-sm transition-all hover:border-brand hover:text-brand"
              >
                Book a Session
              </Link>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="label-eyebrow text-muted-foreground">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-brand" />
        </motion.span>
      </motion.div>

      {/* Side meta */}
      <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 rotate-90 origin-right items-center gap-3 lg:flex">
        <span className="label-eyebrow text-muted-foreground">
          Est. Cinematography Studio
        </span>
        <span className="h-px w-12 bg-border" />
      </div>
    </section>
  );
}

function ShowreelButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("lumen:open-showreel", { detail: url })
        )
      }
      className="group inline-flex items-center gap-3 rounded-full border border-border bg-card/40 px-6 py-3.5 text-sm font-medium backdrop-blur-sm transition-all hover:border-brand hover:text-brand"
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-brand text-black">
        <Play className="h-3 w-3 fill-current" />
        <span className="absolute inset-0 rounded-full animate-pulse-ring" />
      </span>
      Watch Showreel
    </button>
  );
}
