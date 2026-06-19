import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Images } from "lucide-react";
import { db } from "@/lib/db";
import { parseJsonArray, parseBtsGallery } from "@/lib/api";
import { getSiteConfig } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/sidebar";
import { ProjectForm } from "@/components/admin/project-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { DeliveryManager } from "@/components/admin/delivery-manager";
import { PhotoBatchManager } from "@/components/admin/photo-batch-manager";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await db.project.findUnique({ where: { id } });
  if (!row) notFound();

  const config = await getSiteConfig();
  const faceMatchEnabled = config.featureFlags?.faceMatchEnabled ?? false;

  const initial = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    client: row.client ?? "",
    year: row.year ? String(row.year) : "",
    location: row.location ?? "",
    role: row.role ?? "",
    description: row.description,
    excerpt: row.excerpt ?? "",
    thumbnail: row.thumbnail ?? "",
    thumbnailAlt: row.thumbnailAlt ?? "",
    posterImage: row.posterImage ?? "",
    videoUrl: row.videoUrl ?? "",
    gallery: parseJsonArray(row.gallery),
    btsGallery: parseBtsGallery(row.btsGallery),
    tags: parseJsonArray(row.tags),
    featured: row.featured,
    published: row.published,
    order: row.order,
  };

  // Count pending/ready deliveries for the section header badge
  const pendingDeliveries = await db.projectDelivery.count({
    where: { projectId: row.id, status: { in: ["PENDING", "READY"] } },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <DeleteButton endpoint={`/api/projects/${row.id}`} redirectTo="/admin/projects" />
      </div>
      <AdminHeader title="Edit Project" description={row.title} />

      <ProjectForm initial={initial} />

      {/* Client delivery management */}
      <div className="space-y-4 border-t border-border pt-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <Package className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold">Client delivery</h2>
            <p className="text-xs text-muted-foreground">
              Track deliverables + generate shareable client download pages.
              {pendingDeliveries > 0 && (
                <span className="ml-1 font-medium text-amber-500">
                  {pendingDeliveries} pending
                </span>
              )}
            </p>
          </div>
        </div>
        <DeliveryManager projectId={row.id} />
      </div>

      {/* Face-match photo batch (feature-flagged) */}
      {faceMatchEnabled && (
        <div className="space-y-4 border-t border-border pt-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <Images className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Photo batches</h2>
              <p className="text-xs text-muted-foreground">
                Upload event photos + let clients find themselves via selfie. Face detection runs in the browser — no server cost.
              </p>
            </div>
          </div>
          <PhotoBatchManager projectId={row.id} />
        </div>
      )}
    </div>
  );
}
