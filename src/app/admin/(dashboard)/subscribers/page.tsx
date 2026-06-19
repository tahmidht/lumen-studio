import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { SubscribersManager } from "@/components/admin/subscribers-manager";
import { ExportButton } from "@/components/admin/export-button";
import type { Subscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const rows = await db.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
  const subscribers: Subscriber[] = rows.map((s) => ({ ...s }));
  const activeCount = subscribers.filter((s) => s.active).length;

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Subscribers"
        description={
          subscribers.length > 0
            ? `${activeCount} active of ${subscribers.length} total subscriber${
                subscribers.length === 1 ? "" : "s"
              }.`
            : "Newsletter signups from your footer form."
        }
        action={
          <ExportButton
            endpoint="/api/subscribers"
            filename="subscribers.csv"
            label="Export CSV"
            columns={[
              { from: "email", to: "email" },
              { from: "active", to: "status", format: "bool-status" },
              { from: "createdAt", to: "subscribedAt", format: "iso" },
            ]}
          />
        }
      />
      <SubscribersManager subscribers={subscribers} />
    </div>
  );
}
