"use client";
import Link from "next/link";
import { Clapperboard, Pencil, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import { cn } from "@/lib/utils";
import type { ProcessStep } from "@/lib/types";

export function ProcessStepsManager({ steps }: { steps: ProcessStep[] }) {
  if (steps.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 border-dashed py-12 text-center">
        <Clapperboard className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-display text-lg font-semibold">No process steps yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tell the story of how a film comes to life — discovery, shoot day,
          edit, color grade, delivery. Add a BTS photo to each step for extra
          cinematic weight.
        </p>
        <Button asChild className="mt-2 bg-brand text-black hover:bg-brand/90">
          <Link href="/admin/process/new">
            <Plus className="mr-2 h-4 w-4" />
            New step
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <Card
          key={s.id}
          className="group flex items-start gap-4 border-border bg-card p-4 transition-colors hover:border-brand/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 font-mono text-xs font-bold text-brand">
            {String(i + 1).padStart(2, "0")}
          </span>
          {s.image && (
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
              <img
                src={s.image}
                alt={s.imageAlt || s.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-medium">{s.title}</p>
              {s.phase && (
                <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                  {s.phase}
                </span>
              )}
              {!s.published && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                  Draft
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {s.description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-brand"
            >
              <Link href={`/admin/process/${s.id}`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <DuplicateButton
              endpoint={`/api/process-steps/${s.id}/duplicate`}
              editHref="/admin/process"
            />
            <DeleteButton endpoint={`/api/process-steps/${s.id}`} size="sm" />
          </div>
        </Card>
      ))}
    </div>
  );
}

void cn;
