import Link from "next/link";
import { Plus, Quote } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { Card } from "@/components/ui/card";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";
import type { Testimonial } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const rows = await db.testimonial.findMany({ orderBy: { order: "asc" } });

  if (rows.length === 0) {
    return (
      <div className="space-y-8">
        <AdminHeader
          title="Testimonials"
          description="Client quotes shown in the Testimonials section."
          action={
            <Link
              href="/admin/testimonials/new"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              New Testimonial
            </Link>
          }
        />
        <Card className="flex flex-col items-center gap-3 border-dashed py-20 text-center">
          <Quote className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-lg font-semibold">No testimonials yet</p>
        </Card>
      </div>
    );
  }

  const testimonials: Testimonial[] = rows.map((t) => ({ ...t }));

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Testimonials"
        description="Client quotes shown in the Testimonials section. Toggle to Reorder mode to drag-arrange them."
        action={
          <Link
            href="/admin/testimonials/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Testimonial
          </Link>
        }
      />
      <TestimonialsManager testimonials={testimonials} />
    </div>
  );
}
