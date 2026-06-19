"use client";
import { useState } from "react";
import { Loader2, Mail, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Newsletter signup form for the footer. Validates email, POSTs to
 * /api/subscribers, shows inline success state. Idempotent — re-subscribing
 * an existing email is a no-op (returns alreadySubscribed).
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Subscription failed");
      setDone(true);
      setEmail("");
      toast.success(
        json.data.alreadySubscribed
          ? "You're already on the list!"
          : "Subscribed — welcome aboard."
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/5 px-4 py-3"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-black">
            <Check className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium">You're subscribed</p>
            <p className="text-xs text-muted-foreground">
              Field notes + new work, occasionally.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={submit}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative flex w-full max-w-sm items-center"
        >
          <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="h-11 w-full rounded-full border border-border bg-card/40 pl-10 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Subscribe"
            className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-black transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
