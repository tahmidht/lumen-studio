"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportCSV } from "@/lib/csv";

/**
 * Column mapping spec — declarative (no functions) so it can cross the
 * server/client boundary. `from` is the source key, `to` is the CSV column
 * header. Optional `format` handles date conversion etc.
 */
export type ExportColumn = {
  from: string;
  to: string;
  format?: "iso" | "bool-status";
};

/**
 * Button that fetches rows from an API endpoint and exports them as CSV.
 * Uses a declarative column spec (no function props) so it works as a
 * client component rendered from a server component.
 */
export function ExportButton({
  endpoint,
  filename,
  label = "Export CSV",
  columns,
}: {
  endpoint: string;
  filename: string;
  label?: string;
  columns: ExportColumn[];
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Fetch failed");
      const rows: Record<string, unknown>[] = Array.isArray(json.data)
        ? json.data
        : [];
      if (rows.length === 0) {
        toast.info("Nothing to export yet.");
        return;
      }
      const mapped = rows.map((row) => {
        const out: Record<string, unknown> = {};
        for (const col of columns) {
          const v = row[col.from];
          if (col.format === "iso" && v) {
            out[col.to] = new Date(v as string).toISOString();
          } else if (col.format === "bool-status") {
            out[col.to] = v ? "active" : "inactive";
          } else {
            out[col.to] = v ?? "";
          }
        }
        return out;
      });
      exportCSV(filename, mapped);
      toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/40 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-brand hover:text-brand disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
