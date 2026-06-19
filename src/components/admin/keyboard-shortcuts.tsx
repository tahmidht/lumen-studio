"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command } from "lucide-react";

/**
 * Admin keyboard shortcuts — a Linear/GitHub-style "g then key" navigation
 * system, plus a "?" help dialog. Mount once in the admin dashboard layout.
 *
 * Shortcuts:
 *   g d → Dashboard        g p → Projects      g s → Services
 *   g t → Testimonials     g a → Awards        g g → Gear
 *   g j → Journal          g f → FAQs          g i → Inquiries
 *   g m → Subscribers (mail) g l → Activity log
 *   g o → About            g c → Settings (config)  g u → Account (user)
 *   ?   → Toggle this help dialog
 *   /   → Focus the next text input on the page (quick-find)
 *   Esc → Close dialog
 */
const SHORTCUTS: { keys: string; label: string; href: string }[] = [
  { keys: "g d", label: "Dashboard", href: "/admin" },
  { keys: "g p", label: "Projects", href: "/admin/projects" },
  { keys: "g s", label: "Services", href: "/admin/services" },
  { keys: "g t", label: "Testimonials", href: "/admin/testimonials" },
  { keys: "g a", label: "Awards", href: "/admin/awards" },
  { keys: "g g", label: "Gear", href: "/admin/gear" },
  { keys: "g j", label: "Journal", href: "/admin/journal" },
  { keys: "g e", label: "Process Steps", href: "/admin/process" },
  { keys: "g f", label: "FAQs", href: "/admin/faqs" },
  { keys: "g i", label: "Inquiries", href: "/admin/inquiries" },
  { keys: "g m", label: "Subscribers", href: "/admin/subscribers" },
  { keys: "g l", label: "Activity Log", href: "/admin/activity" },
  { keys: "g o", label: "About", href: "/admin/about" },
  { keys: "g c", label: "Settings", href: "/admin/settings" },
  { keys: "g n", label: "AI Settings", href: "/admin/settings?tab=ai" },
  { keys: "g u", label: "Account", href: "/admin/account" },
  { keys: "?", label: "Show this help", href: "__help__" },
  { keys: "Esc", label: "Close dialog", href: "__close__" },
];

const GO_MAP: Record<string, string> = {
  d: "/admin",
  p: "/admin/projects",
  s: "/admin/services",
  t: "/admin/testimonials",
  a: "/admin/awards",
  g: "/admin/gear",
  j: "/admin/journal",
  e: "/admin/process",
  f: "/admin/faqs",
  i: "/admin/inquiries",
  m: "/admin/subscribers",
  l: "/admin/activity",
  o: "/admin/about",
  c: "/admin/settings",
  n: "/admin/settings?tab=ai",
  u: "/admin/account",
};

export function AdminKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);

  const go = useCallback(
    (href: string) => {
      if (href === "__help__") {
        setHelpOpen((v) => !v);
        return;
      }
      if (href === "__close__") {
        setHelpOpen(false);
        return;
      }
      if (href !== pathname) router.push(href);
      setHelpOpen(false);
    },
    [pathname, router]
  );

  useEffect(() => {
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas/contenteditable
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          t.isContentEditable
        ) {
          // still allow Esc to blur
          if (e.key === "Escape") (t as HTMLElement).blur();
          return;
        }
      }

      // Esc always closes
      if (e.key === "Escape") {
        setHelpOpen(false);
        setPendingG(false);
        return;
      }

      // "?" toggles help
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }

      // "g" starts a chord
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setPendingG(true);
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => setPendingG(false), 800);
        return;
      }

      // If we're mid-chord, the next key completes it
      if (pendingG) {
        const target = GO_MAP[e.key.toLowerCase()];
        if (target) {
          e.preventDefault();
          setPendingG(false);
          if (gTimer) clearTimeout(gTimer);
          go(target);
        } else {
          setPendingG(false);
        }
        return;
      }

      // "/" focuses the first input on the page
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const input = document.querySelector<HTMLInputElement>(
          'input[type="text"], input[type="search"], input:not([type])'
        );
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [pendingG, go]);

  // Chord indicator (bottom-right, ephemeral)
  return (
    <>
      <AnimatePresence>
        {pendingG && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-lg border border-brand/40 bg-card px-3 py-2 text-xs shadow-lg"
          >
            <kbd className="rounded bg-brand px-1.5 py-0.5 font-mono text-[10px] font-bold text-black">
              g
            </kbd>
            <span className="text-muted-foreground">then…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating help trigger */}
      <button
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-6 left-6 z-40 hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-brand/50 hover:text-brand lg:flex"
        title="Keyboard shortcuts (?)"
      >
        <Command className="h-3.5 w-3.5" />
        <kbd className="font-mono">?</kbd>
      </button>

      {/* Help dialog */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setHelpOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                    <Search className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-sm font-semibold">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Navigate the studio dashboard like a power user.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setHelpOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-5 scroll-cinema">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Navigation (press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">g</kbd> then…)
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {SHORTCUTS.filter((s) => s.keys.startsWith("g ")).map((s) => (
                    <button
                      key={s.href}
                      onClick={() => go(s.href)}
                      className="group flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-left text-sm transition-colors hover:border-brand/40 hover:bg-background"
                    >
                      <span className="text-foreground group-hover:text-brand">{s.label}</span>
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground group-hover:bg-brand group-hover:text-black">
                        {s.keys.replace("g ", "")}
                      </kbd>
                    </button>
                  ))}
                </div>

                <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  General
                </p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {SHORTCUTS.filter((s) => !s.keys.startsWith("g ")).map((s) => (
                    <button
                      key={s.label}
                      onClick={() => go(s.href)}
                      className="group flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-left text-sm transition-colors hover:border-brand/40 hover:bg-background"
                    >
                      <span className="text-foreground group-hover:text-brand">{s.label}</span>
                      <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground group-hover:bg-brand group-hover:text-black">
                        {s.keys}
                      </kbd>
                    </button>
                  ))}
                </div>

                <p className="mt-6 rounded-lg bg-background/40 p-3 text-xs text-muted-foreground">
                  Tip: shortcuts are disabled while typing in form fields.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
