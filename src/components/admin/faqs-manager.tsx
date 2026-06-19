"use client";
import Link from "next/link";
import { HelpCircle, Pencil, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import { cn } from "@/lib/utils";
import type { Faq } from "@/lib/types";

export function FaqsManager({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 border-dashed py-12 text-center">
        <HelpCircle className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-display text-lg font-semibold">No FAQs yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Answer the questions your clients keep asking — booking, gear,
          deliverables, payment terms.
        </p>
        <Button asChild className="mt-2 bg-brand text-black hover:bg-brand/90">
          <Link href="/admin/faqs/new">
            <Plus className="mr-2 h-4 w-4" />
            New FAQ
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((f) => (
        <Card
          key={f.id}
          className="group flex items-start gap-4 border-border bg-card p-4 transition-colors hover:border-brand/40"
        >
          <span
            className={cn(
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              f.published ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"
            )}
          >
            <HelpCircle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-medium">{f.question}</p>
              <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                {f.category}
              </span>
              {!f.published && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                  Draft
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {f.answer.replace(/[#*>`_-]/g, "").slice(0, 180)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-brand"
            >
              <Link href={`/admin/faqs/${f.id}`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <DuplicateButton endpoint={`/api/faqs/${f.id}/duplicate`} editHref="/admin/faqs" />
            <DeleteButton endpoint={`/api/faqs/${f.id}`} size="sm" />
          </div>
        </Card>
      ))}
    </div>
  );
}
