"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Copy, Check, X, Instagram, Linkedin, Twitter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SocialPosts = {
  instagram: string;
  linkedin: string;
  twitter: string;
};

/**
 * Social media post generator modal — calls /api/ai/social-posts with project
 * details, displays 3 tabs (Instagram / LinkedIn / Twitter) with copy buttons.
 *
 * Triggered by the parent passing `open` + `projectDetails`.
 */
export function SocialPostsModal({
  open,
  onClose,
  projectDetails,
}: {
  open: boolean;
  onClose: () => void;
  projectDetails: {
    title: string;
    category: string;
    excerpt?: string | null;
    tags?: string[];
    siteName: string;
  };
}) {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<SocialPosts | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"instagram" | "linkedin" | "twitter">("instagram");
  const [copied, setCopied] = useState<string | null>(null);
  const initiatedRef = useRef(false);

  // Reset the initiated flag when the modal closes so it can re-open + re-generate
  useEffect(() => {
    if (!open) {
      initiatedRef.current = false;
      setPosts(null);
      setRawText(null);
      setLoading(false);
    }
  }, [open]);

  // Auto-generate ONCE when the modal opens (not on every render)
  useEffect(() => {
    if (open && !initiatedRef.current && !loading && !posts && !rawText) {
      initiatedRef.current = true;
      generate();
    }
  }, [open, loading, posts, rawText]);

  async function generate() {
    setLoading(true);
    setPosts(null);
    setRawText(null);
    try {
      const res = await fetch("/api/ai/social-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectDetails),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      if (json.data.posts) {
        setPosts(json.data.posts);
      } else {
        // Fallback: raw text
        setRawText(json.data.text);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard");
  }

  const tabs = [
    { id: "instagram" as const, label: "Instagram", icon: Instagram },
    { id: "linkedin" as const, label: "LinkedIn", icon: Linkedin },
    { id: "twitter" as const, label: "Twitter / X", icon: Twitter },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold">Social media posts</h3>
                  <p className="text-xs text-muted-foreground">For: {projectDetails.title}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                  <span className="ml-2 text-sm text-muted-foreground">Generating 3 posts…</span>
                </div>
              ) : rawText ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    AI returned raw text (JSON parsing failed). Copy what you need:
                  </p>
                  <pre className="whitespace-pre-wrap rounded-lg border border-border bg-background/40 p-4 text-xs">
                    {rawText}
                  </pre>
                  <button
                    onClick={() => copy(rawText, "raw")}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-black"
                  >
                    {copied === "raw" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy all
                  </button>
                </div>
              ) : posts ? (
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className="flex gap-1 rounded-lg border border-border bg-background/40 p-1">
                    {tabs.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setActiveTab(t.id)}
                          className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                            activeTab === t.id
                              ? "bg-brand text-black"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active post */}
                  <div className="relative">
                    <p className="whitespace-pre-wrap rounded-lg border border-border bg-background/40 p-4 text-sm text-foreground/90">
                      {posts[activeTab]}
                    </p>
                    <button
                      onClick={() => copy(posts[activeTab], activeTab)}
                      className="absolute right-2 top-2 rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:text-brand"
                      title="Copy"
                    >
                      {copied === activeTab ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {posts[activeTab].length} characters
                  </p>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {!loading && (
              <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                <button
                  onClick={onClose}
                  className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
