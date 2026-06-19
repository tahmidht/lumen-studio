"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";
import Link from "next/link";

/**
 * GDPR-style cookie consent banner. Shows on first visit (localStorage-
 * guarded). Renders as a slim bottom bar — non-intrusive, doesn't overlap
 * content. Dismissed via Accept / Decline / X.
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const decision = localStorage.getItem("lumen-cookie-consent");
    if (!decision) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  function decide(choice: "accepted" | "declined") {
    localStorage.setItem("lumen-cookie-consent", choice);
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[90] border-t border-border bg-card/95 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-5 py-3 sm:flex-row sm:items-center sm:gap-4 md:px-8">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Cookie className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground text-pretty">
              We use cookies for analytics. We also collect emails via our
 newsletter + contact form.{" "}
              <Link
                href="/privacy"
                className="text-brand underline underline-offset-2 hover:no-underline"
              >
                Privacy notice
              </Link>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => decide("accepted")}
                className="inline-flex items-center gap-1 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-black transition hover:brightness-110"
              >
                <Check className="h-3 w-3" />
                Accept
              </button>
              <button
                onClick={() => decide("declined")}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition hover:border-brand/50 hover:text-foreground"
              >
                Decline
              </button>
              <button
                onClick={() => decide("declined")}
                aria-label="Dismiss"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
