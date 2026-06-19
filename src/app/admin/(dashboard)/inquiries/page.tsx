import Link from "next/link";
import { Inbox, Mail, ArrowUpRight, Star } from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { Card } from "@/components/ui/card";
import { statusLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ExportButton } from "@/components/admin/export-button";
import { InquiryStarButton } from "@/components/admin/inquiry-star-button";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-brand/15 text-brand",
  READ: "bg-muted text-muted-foreground",
  REPLIED: "bg-emerald-500/15 text-emerald-500",
  ARCHIVED: "bg-muted text-muted-foreground/60",
};

export default async function AdminInquiriesPage() {
  // Starred first, then newest first.
  const rows = await db.inquiry.findMany({
    orderBy: [{ starred: "desc" }, { createdAt: "desc" }],
  });
  const starredCount = rows.filter((r) => r.starred).length;

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Inquiries"
        description={
          rows.length > 0
            ? `${rows.length} total${starredCount > 0 ? ` · ${starredCount} starred` : ""}. Booking requests and messages from your contact form.`
            : "Booking requests and messages from your contact form."
        }
        action={
          <ExportButton
            endpoint="/api/inquiries"
            filename="inquiries.csv"
            label="Export CSV"
            columns={[
              { from: "name", to: "name" },
              { from: "email", to: "email" },
              { from: "phone", to: "phone" },
              { from: "projectType", to: "projectType" },
              { from: "budget", to: "budget" },
              { from: "eventDate", to: "eventDate" },
              { from: "starred", to: "starred", format: "bool-status" },
              { from: "status", to: "status" },
              { from: "message", to: "message" },
              { from: "createdAt", to: "receivedAt", format: "iso" },
            ]}
          />
        }
      />

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed py-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-lg font-semibold">No inquiries yet</p>
          <p className="text-sm text-muted-foreground">Submissions from your contact form will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((i) => (
            <Link key={i.id} href={`/admin/inquiries/${i.id}`}>
              <Card
                className={cn(
                  "group flex items-center gap-4 border-border bg-card p-4 transition-colors hover:border-brand/40",
                  i.starred && "border-brand/40 bg-brand/[0.03]"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    i.starred ? "bg-brand/15 text-brand" : "bg-brand/10 text-brand/70"
                  )}
                >
                  {i.starred ? <Star className="h-4 w-4 fill-current" /> : <Mail className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{i.name}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", STATUS_STYLE[i.status] || STATUS_STYLE.NEW)}>
                      {statusLabel(i.status)}
                    </span>
                    {i.starred && (
                      <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand">
                        Starred
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {i.projectType || "General"} · {i.message.slice(0, 80)}
                    {i.message.length > 80 ? "…" : ""}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                  {new Date(i.createdAt).toLocaleDateString()}
                  <br />
                  {new Date(i.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <InquiryStarButton inquiryId={i.id} starred={i.starred} size="sm" />
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
