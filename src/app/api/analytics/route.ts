import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, serverError } from "@/lib/api";
import { PROJECT_CATEGORIES, categoryLabel } from "@/lib/constants";

/** GET /api/analytics — aggregated stats for the dashboard charts (admin). */
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    // Inquiries over last 14 days
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const inquiries = await db.inquiry.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, status: true },
    });

    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = inquiries.filter((q) => {
        const t = q.createdAt.getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      });
    }

    // Projects by category
    const projects = await db.project.findMany({
      select: { category: true, published: true, featured: true },
    });
    const byCategory = PROJECT_CATEGORIES.map((c) => ({
      category: categoryLabel(c),
      raw: c,
      count: projects.filter((p) => p.category === c).length,
    })).filter((x) => x.count > 0);

    // Inquiry status breakdown
    const allInquiries = await db.inquiry.findMany({ select: { status: true } });
    const statusBreakdown = ["NEW", "READ", "REPLIED", "ARCHIVED"].map((s) => ({
      status: s,
      count: allInquiries.filter((q) => q.status === s).length,
    }));

    // Published vs draft projects
    const publishedVsDraft = {
      published: projects.filter((p) => p.published).length,
      draft: projects.filter((p) => !p.published).length,
      featured: projects.filter((p) => p.featured).length,
    };

    return ok({
      inquiryTrend: days,
      projectsByCategory: byCategory,
      inquiryStatus: statusBreakdown,
      publishedVsDraft,
      totalInquiries: allInquiries.length,
    });
  } catch (err) {
    return serverError("Failed to load analytics", err);
  }
}
