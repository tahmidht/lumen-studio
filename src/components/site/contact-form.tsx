"use client";
import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_TYPES, BUDGET_RANGES } from "@/lib/constants";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    budget: "",
    eventDate: "",
    message: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Submission failed");
      setDone(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        projectType: "",
        budget: "",
        eventDate: "",
        message: "",
      });
      toast.success("Message sent! I'll be in touch soon.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold">Message received</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks for reaching out. I'll get back to you within 24 hours.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setDone(false)}
        >
          Send another
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name *">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            required
          />
        </Field>
        <Field label="Email *">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@email.com"
            required
          />
        </Field>
        <Field label="Phone">
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </Field>
        <Field label="Event / Project date">
          <Input
            type="date"
            value={form.eventDate}
            onChange={(e) => set("eventDate", e.target.value)}
          />
        </Field>
        <Field label="Project type">
          <Select value={form.projectType} onValueChange={(v) => set("projectType", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Budget">
          <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a range" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_RANGES.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="mt-5">
        <Field label="Tell me about your project *">
          <Textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            rows={6}
            placeholder="What are you creating? What's the vibe? When do you need it?"
            required
          />
        </Field>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-brand text-black hover:bg-brand/90 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Send Message
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
