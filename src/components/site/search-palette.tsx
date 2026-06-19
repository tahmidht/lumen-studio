"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Film, Newspaper, ArrowRight, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Result = {
  type: "project" | "post";
  id: string;
  title: string;
  href: string;
  subtitle: string;
  image: string | null;
  meta: string;
};

/**
 * Global ⌘K / Ctrl+K search palette.
 * Searches published projects + journal posts via /api/search.
 */
export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // open/close handlers + global hotkey + custom trigger event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onTrigger = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("lumen:open-search", onTrigger);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("lumen:open-search", onTrigger);
    };
  }, []);

  // focus on open, clear on close
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // debounce search
  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.ok) setResults(json.data.results);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const onQueryChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(v.trim().length >= 2);
    debounceRef.current = setTimeout(() => runSearch(v), 220);
  };

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/50"
          >
            <Command
              label="Search"
              className="flex flex-col"
              shouldFilter={false}
            >
              {/* Input row */}
              <div className="flex items-center gap-3 border-b border-border px-4">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
                <Command.Input
                  ref={inputRef}
                  value={query}
                  onValueChange={onQueryChange}
                  placeholder="Search projects, journal…"
                  className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Results */}
              <Command.List className="max-h-[50vh] overflow-y-auto scroll-cinema p-2">
                {query.trim().length < 2 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    <Search className="mx-auto mb-3 h-6 w-6 opacity-30" />
                    Start typing to search across projects and journal.
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                      <Kbd>⌘K</Kbd> to open · <Kbd>esc</Kbd> to close
                    </div>
                  </div>
                )}

                {query.trim().length >= 2 && !loading && results.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No results for “{query}”.
                  </div>
                )}

                {loading && results.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Searching…
                  </div>
                )}

                {results.length > 0 && (
                  <Command.Group>
                    {results.map((r) => (
                      <Command.Item
                        key={`${r.type}-${r.id}`}
                        value={`${r.title} ${r.subtitle}`}
                        onSelect={() => go(r.href)}
                        className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-brand/10 aria-selected:text-foreground transition-colors"
                      >
                        <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                          {r.image ? (
                             
                            <img
                              src={r.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-muted-foreground/40">
                              {r.type === "project" ? (
                                <Film className="h-4 w-4" />
                              ) : (
                                <Newspaper className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {r.title}
                            </span>
                            <span className="shrink-0 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-brand">
                              {r.type === "project" ? "Work" : "Journal"}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {r.meta} · {r.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-aria-selected:opacity-100 group-hover:opacity-100" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                <span>
                  {results.length > 0
                    ? `${results.length} result${results.length === 1 ? "" : "s"}`
                    : "Search the studio"}
                </span>
                <div className="flex items-center gap-2">
                  <Kbd>↑↓</Kbd> navigate · <Kbd>↵</Kbd> open
                </div>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  );
}
