"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import type { Faq } from "@/lib/types";
import { SectionHeader } from "@/components/site/featured-work";
import { cn } from "@/lib/utils";

/**
 * Public FAQ section — renders an accordion of admin-managed FAQs,
 * grouped by category. Used on /services and /about.
 */
export function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (!faqs.length) return null;

  // Group by category, preserving insertion order.
  const groups = new Map<string, Faq[]>();
  for (const f of faqs) {
    const cat = f.category || "General";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(f);
  }

  return (
    <section id="faq" className="relative border-t border-border py-24 md:py-32">
      {/* ambient brand glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,var(--brand-glow,rgba(232,181,71,0.06))_0%,transparent_70%)]" />
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Questions"
          title="Good to know"
          description="The things clients ask most. Don't see yours? Reach out — happy to answer."
        />

        <div className="mt-14 space-y-10">
          {Array.from(groups.entries()).map(([cat, items]) => (
            <div key={cat}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {cat}
                </h3>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-2">
                {items.map((f) => {
                  const open = openId === f.id;
                  return (
                    <div
                      key={f.id}
                      className={cn(
                        "overflow-hidden rounded-xl border bg-card transition-colors",
                        open ? "border-brand/40" : "border-border hover:border-brand/30"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : f.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        aria-expanded={open}
                      >
                        <span className="font-medium text-foreground">{f.question}</span>
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
                            open ? "bg-brand text-black" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground text-pretty">
                              {f.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
