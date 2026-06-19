"use client";
import Link from "next/link";
import { Star } from "lucide-react";
import { ReorderManager, DragRow } from "@/components/admin/reorder-manager";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import type { Testimonial } from "@/lib/types";

export function TestimonialsManager({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const gridView = (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {testimonials.map((t) => (
        <Card key={t.id} className="flex flex-col border-border bg-card p-5">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < t.rating
                    ? "h-3.5 w-3.5 fill-brand text-brand"
                    : "h-3.5 w-3.5 text-muted-foreground/30"
                }
              />
            ))}
          </div>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-4">
            “{t.content}”
          </p>
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-sm font-semibold">{t.name}</p>
            <p className="text-xs text-muted-foreground">
              {[t.role, t.company].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Link
              href={`/admin/testimonials/${t.id}`}
              className="text-sm text-brand hover:underline"
            >
              Edit
            </Link>
            <div className="flex items-center gap-1">
              <DuplicateButton endpoint={`/api/testimonials/${t.id}/duplicate`} editHref="/admin/testimonials" />
              <DeleteButton endpoint={`/api/testimonials/${t.id}`} size="sm" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <ReorderManager
      items={testimonials}
      entity="testimonial"
      countLabel={`${testimonials.length} testimonial${testimonials.length === 1 ? "" : "s"}`}
      gridView={gridView}
      renderRow={(item, handle) => (
        <DragRow handle={handle}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand">
            {item.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-display text-sm font-semibold">
                {item.name}
              </h4>
              {!item.published && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                  Draft
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {[item.role, item.company].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < item.rating
                    ? "h-3 w-3 fill-brand text-brand"
                    : "h-3 w-3 text-muted-foreground/20"
                }
              />
            ))}
          </div>
        </DragRow>
      )}
    />
  );
}
