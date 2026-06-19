"use client";
import { motion } from "framer-motion";
import type { Gear } from "@/lib/types";
import { gearCategoryLabel } from "@/lib/constants";
import { SectionHeader } from "@/components/site/featured-work";

export function GearSection({ gear }: { gear: Gear[] }) {
  if (!gear.length) return null;
  // group by category
  const groups = gear.reduce<Record<string, Gear[]>>((acc, g) => {
    (acc[g.category] ??= []).push(g);
    return acc;
  }, {});
  const categories = Object.keys(groups);

  return (
    <section className="relative border-y border-border bg-card/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="The Kit"
          title="Tools behind the frames"
          description="Professional-grade cameras, glass, gimbals, and drones — ready for anything the story demands."
        />

        <div className="mt-14 space-y-12">
          {categories.map((cat, ci) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: ci * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span className="label-eyebrow text-brand">
                  {gearCategoryLabel(cat)}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groups[cat].map((g) => (
                  <div
                    key={g.id}
                    className="group rounded-xl border border-border bg-background/40 p-5 transition-all hover:border-brand/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-display text-base font-semibold">
                        {g.name}
                      </h4>
                      {g.brand && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {g.brand}
                        </span>
                      )}
                    </div>
                    {g.description && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
                        {g.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
