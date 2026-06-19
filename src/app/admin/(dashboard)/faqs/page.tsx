import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { FaqsManager } from "@/components/admin/faqs-manager";
import { Button } from "@/components/ui/button";
import type { Faq } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const rows = await db.faq.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  const faqs: Faq[] = rows.map((r) => ({ ...r }));
  const published = faqs.filter((f) => f.published).length;

  return (
    <div className="space-y-8">
      <AdminHeader
        title="FAQs"
        description={
          faqs.length > 0
            ? `${published} published of ${faqs.length} total. Shown on /services and /about.`
            : "Answer the questions your clients keep asking."
        }
        action={
          <Button asChild className="bg-brand text-black hover:bg-brand/90">
            <Link href="/admin/faqs/new">
              <Plus className="mr-2 h-4 w-4" />
              New FAQ
            </Link>
          </Button>
        }
      />
      <FaqsManager faqs={faqs} />
    </div>
  );
}
