"use client";
import { useState, useRef } from "react";
import { Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Image/media upload field.
 * - Drag-drop or click to upload (POST /api/upload, admin-only)
 * - Also accepts a pasted URL as a fallback
 */
export function MediaInput({
  value,
  onChange,
  label,
  accept = "image/*",
  preview = true,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  preview?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setLoading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Upload failed");
      onChange(json.data.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}
      <div className="flex gap-3">
        {preview && (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
            {value ? (
              <>
                {value.match(/\.(mp4|webm)$/i) ? (
                  <video
                    src={value}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                   
                  <img
                    src={value}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/40">
                <Upload className="h-4 w-4" />
              </div>
            )}
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm transition-colors",
              dragOver
                ? "border-brand bg-brand/5 text-brand"
                : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{loading ? "Uploading…" : "Drop or click to upload"}</span>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…or paste a URL"
              className="h-9 text-sm"
            />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      </div>
    </div>
  );
}
