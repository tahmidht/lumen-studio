import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { parseJsonArray, parseBtsGallery } from "@/lib/api";
import { AdminHeader } from "@/components/admin/sidebar";
import { ProjectsManager } from "@/components/admin/projects-manager";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const rows = await db.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  const projects: Project[] = rows.map((p) => ({
    ...p,
    gallery: parseJsonArray(p.gallery),
    btsGallery: parseBtsGallery(p.btsGallery),
    tags: parseJsonArray(p.tags),
  }));

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Projects"
        description="Your portfolio films. Toggle to Reorder mode and drag to rearrange — mark featured to surface on the homepage."
        action={
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        }
      />
      <ProjectsManager projects={projects} />
    </div>
  );
}
