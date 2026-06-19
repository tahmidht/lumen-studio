"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ReorderManager, DragRow } from "@/components/admin/reorder-manager";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import type { Service } from "@/lib/types";

/**
 * Services manager: grid view (with edit/delete) + drag-to-reorder list.
 */
export function ServicesManager({ services }: { services: Service[] }) {
  const gridView = (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {services.map((s) => (
        <Card key={s.id} className="border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <span className="rounded-md bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
              {s.icon || "Service"}
            </span>
            {!s.published && (
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                Draft
              </span>
            )}
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {s.description}
          </p>
          {s.features.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {s.features.length} features · {s.priceFrom || "—"}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <Link
              href={`/admin/services/${s.id}`}
              className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
            >
              Edit <ArrowUpRight className="h-3 w-3" />
            </Link>
            <div className="flex items-center gap-2">
              <DuplicateButton
                endpoint={`/api/services/${s.id}/duplicate`}
                editHref="/admin/services"
              />
              <DeleteButton endpoint={`/api/services/${s.id}`} size="sm" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <ReorderManager
      items={services}
      entity="service"
      countLabel={`${services.length} service${services.length === 1 ? "" : "s"}`}
      gridView={gridView}
      renderRow={(item, handle) => (
        <DragRow handle={handle}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-xs font-bold text-brand">
            {(item.title || "?").charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-display text-sm font-semibold">
                {item.title}
              </h4>
              {!item.published && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                  Draft
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.features.length} features · {item.priceFrom || "—"}
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
