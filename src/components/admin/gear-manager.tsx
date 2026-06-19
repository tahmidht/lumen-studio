"use client";
import Link from "next/link";
import { Camera, ArrowUpRight } from "lucide-react";
import { ReorderManager, DragRow } from "@/components/admin/reorder-manager";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import { gearCategoryLabel } from "@/lib/constants";
import type { Gear } from "@/lib/types";

export function GearManager({ gear }: { gear: Gear[] }) {
  // group grid view by category
  const groups = gear.reduce<Record<string, Gear[]>>((acc, g) => {
    (acc[g.category] ??= []).push(g);
    return acc;
  }, {});
  const categories = Object.keys(groups);

  const gridView = (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat}>
          <div className="mb-3 flex items-center gap-3">
            <span className="label-eyebrow text-brand">
              {gearCategoryLabel(cat)}
            </span>
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              {groups[cat].length} items
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups[cat].map((g) => (
              <Card key={g.id} className="group border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold">
                      {g.name}
                    </h3>
                    {g.brand && (
                      <p className="text-xs text-muted-foreground">{g.brand}</p>
                    )}
                  </div>
                  {g.image ? (
                     
                    <img
                      src={g.image}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-background text-muted-foreground/40">
                      <Camera className="h-4 w-4" />
                    </span>
                  )}
                </div>
                {g.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {g.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                  <Link
                    href={`/admin/gear/${g.id}`}
                    className="text-sm text-brand hover:underline"
                  >
                    Edit
                  </Link>
                  <div className="flex items-center gap-2">
                    <DuplicateButton
                      endpoint={`/api/gear/${g.id}/duplicate`}
                      editHref="/admin/gear"
                    />
                    <DeleteButton endpoint={`/api/gear/${g.id}`} size="sm" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ReorderManager
      items={gear}
      entity="gear"
      countLabel={`${gear.length} gear items`}
      gridView={gridView}
      renderRow={(item, handle) => (
        <DragRow handle={handle}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground/40">
            <Camera className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-display text-sm font-semibold">
                {item.name}
              </h4>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {gearCategoryLabel(item.category)}
              {item.brand ? ` · ${item.brand}` : ""}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-brand/10 px-2 py-0.5 font-mono text-xs text-brand">
            #{item.order}
          </span>
        </DragRow>
      )}
    />
  );
}
