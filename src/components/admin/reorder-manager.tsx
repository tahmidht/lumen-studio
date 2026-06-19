"use client";
import { useState } from "react";
import { LayoutGrid, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortableList } from "@/components/admin/sortable-list";

type Item = { id: string; order: number };

/**
 * Generic "grid + reorder" manager.
 * - `gridView`: the existing card grid (passed in as ReactNode from the server page)
 * - `items`: the same data, typed, for the draggable list
 * - `entity`: which /api/reorder entity to persist to
 * - `renderRow`: how to render one draggable row (drag handle injected)
 */
export function ReorderManager<T extends Item>({
  gridView,
  items,
  entity,
  renderRow,
  countLabel,
}: {
  gridView: React.ReactNode;
  items: T[];
  entity: "project" | "service" | "testimonial" | "gear" | "award";
  renderRow: (item: T, handle: React.ReactNode) => React.ReactNode;
  countLabel?: string;
}) {
  const [mode, setMode] = useState<"grid" | "reorder">("grid");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {countLabel ?? `${items.length} items`}
        </p>
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setMode("grid")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "grid"
                ? "bg-brand text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            onClick={() => setMode("reorder")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "reorder"
                ? "bg-brand text-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Reorder
          </button>
        </div>
      </div>

      {mode === "reorder" ? (
        <SortableList items={items} entity={entity} renderItem={renderRow} />
      ) : (
        gridView
      )}
    </div>
  );
}

/** Shared draggable row shell so every entity's reorder list looks consistent. */
export function DragRow({
  handle,
  children,
}: {
  handle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 pr-4 transition-colors hover:border-brand/40">
      {handle}
      {children}
    </div>
  );
}
