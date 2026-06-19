import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, serverError } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

/** GET /api/stats — admin dashboard counts */
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const [projects, services, testimonials, gear, posts, inquiries, newInquiries, featuredProjects] =
      await Promise.all([
        db.project.count(),
        db.service.count(),
        db.testimonial.count(),
        db.gear.count(),
        db.blogPost.count(),
        db.inquiry.count(),
        db.inquiry.count({ where: { status: "NEW" } }),
        db.project.count({ where: { featured: true } }),
      ]);
    const stats: DashboardStats = {
      projects,
      services,
      testimonials,
      gear,
      posts,
      inquiries,
      newInquiries,
      featuredProjects,
    };
    return ok(stats);
  } catch (err) {
    return serverError("Failed to load stats", err);
  }
}
