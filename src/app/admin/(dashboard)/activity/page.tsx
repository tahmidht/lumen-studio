import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { ActivityLogManager } from "@/components/admin/activity-log-manager";
import type { ActivityLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const rows = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const initial: ActivityLog[] = rows.map((r) => ({ ...r }));

  const total = await db.activityLog.count();
  const last24h = await db.activityLog.count({
    where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Activity Log"
        description={
          total > 0
            ? `${total} total events · ${last24h} in the last 24h.`
            : "An audit trail of every admin action — creates, updates, deletes, publishes, and more."
        }
      />
      <ActivityLogManager initial={initial} />
    </div>
  );
}
