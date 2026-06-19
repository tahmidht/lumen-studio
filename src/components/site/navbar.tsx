"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X, ArrowUpRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/theme-toggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({
  siteName,
  showScrollProgress = true,
}: {
  siteName: string;
  showScrollProgress?: boolean;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent"
      )}
    >
      {/* Scroll progress bar (admin-toggleable) */}
      {showScrollProgress && (
        <motion.div
          className="absolute bottom-0 left-0 h-px w-full origin-left bg-brand"
          style={{ scaleX: progress }}
        />
      )}
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2"
          aria-label={`${siteName} home`}
        >
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-brand/20 blur-md transition-opacity group-hover:opacity-100" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-brand" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.2em]">
            {siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative text-sm tracking-wide transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-1.5 left-0 h-px w-full bg-brand"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("lumen:open-search"))
            }
            className="group inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card/50 px-3 text-sm text-muted-foreground transition-all hover:border-brand/50 hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden h-5 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] lg:inline-flex">
              ⌘K
            </kbd>
          </button>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-5 py-2 text-sm font-medium transition-all hover:border-brand hover:bg-brand hover:text-black"
          >
            Start a Project
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col px-5 py-4">
              {NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between border-b border-border/60 py-3 text-base",
                      active ? "text-brand" : "text-foreground"
                    )}
                  >
                    {item.label}
                    <ArrowUpRight className="h-4 w-4 opacity-50" />
                  </Link>
                );
              })}
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-black"
              >
                Start a Project
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
