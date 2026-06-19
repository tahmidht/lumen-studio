"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Lightweight tag/string-list editor for JSON array fields. */
export function TagsInput({
  values,
  onChange,
  placeholder = "Add and press Enter",
  label,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  label?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (!values.includes(v)) onChange([...values, v]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-background p-2.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-md bg-brand/15 px-2 py-1 text-sm text-brand"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="flex flex-1 items-center gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
              if (e.key === "Backspace" && !draft && values.length) {
                onChange(values.slice(0, -1));
              }
            }}
            placeholder={placeholder}
            className="h-7 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          />
          {draft && (
            <button
              type="button"
              onClick={add}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-brand"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
