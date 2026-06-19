"use client";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/site/featured-work";

const STEPS = [
  {
    n: "01",
    title: "Discovery & Vision",
    desc: "We talk story. Goals, audience, mood, must-have moments — I translate your vision into a shot plan before a single frame is exposed.",
  },
  {
    n: "02",
    title: "Pre-Production",
    desc: "Location scouting, shotlists, gear selection, crew call. Every detail mapped so shoot day flows like clockwork.",
  },
  {
    n: "03",
    title: "The Shoot",
    desc: "On set with cinema cameras, gimbals, drones and purpose-built lighting. Calm, prepared, ready to chase the light.",
  },
  {
    n: "04",
    title: "Edit & Color",
    desc: "Story-first editing, sound design, and a signature color grade that gives every frame its emotional weight.",
  },
];

export function ProcessSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="The Process"
          title="How a film comes to life"
          description="A proven four-stage workflow that keeps every project on time, on brief, and on another level."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-7 transition-all hover:border-brand/40"
            >
              {/* hover top accent */}
              <div className="pointer-events-none absolute -inset-x-px -top-px h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {/* hover ambient glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-brand/0 blur-3xl transition-all duration-500 group-hover:bg-brand/10" />

              <div className="relative">
                <span className="font-display text-5xl font-bold text-brand/20 transition-colors duration-300 group-hover:text-brand/40">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {s.desc}
                </p>
              </div>

              {/* connector to next step */}
              {i < STEPS.length - 1 && (
                <span className="absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-full bg-gradient-to-r from-border to-transparent lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
