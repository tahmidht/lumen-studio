import Link from "next/link";
import {
  Film,
  Briefcase,
  Quote,
  Camera,
  Newspaper,
  Inbox,
  Sparkles,
  ArrowUpRight,
  Clock,
  HelpCircle,
  History,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Star,
  StarOff,
  LogIn,
  Settings2,
  ArrowUpDown,
  Mail,
  Package,
  Images,
} from "lucide-react";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/sidebar";
import { Card } from "@/components/ui/card";
import { statusLabel } from "@/lib/constants";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { AiUsageSparkline } from "@/components/admin/ai-usage-sparkline";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTION_ICON: Record<string, { icon: typeof Plus; cls: string }> = {
  create: { icon: Plus, cls: "bg-emerald-500/15 text-emerald-400" },
  update: { icon: Pencil, cls: "bg-sky-500/15 text-sky-400" },
  delete: { icon: Trash2, cls: "bg-rose-500/15 text-rose-400" },
  publish: { icon: Eye, cls: "bg-emerald-500/15 text-emerald-400" },
  unpublish: { icon: EyeOff, cls: "bg-amber-500/15 text-amber-400" },
  duplicate: { icon: Copy, cls: "bg-violet-500/15 text-violet-400" },
  feature: { icon: Star, cls: "bg-brand/15 text-brand" },
  unfeature: { icon: StarOff, cls: "bg-muted text-muted-foreground" },
  reorder: { icon: ArrowUpDown, cls: "bg-slate-500/15 text-slate-400" },
  auth: { icon: LogIn, cls: "bg-fuchsia-500/15 text-fuchsia-400" },
  config: { icon: Settings2, cls: "bg-cyan-500/15 text-cyan-400" },
};

function relTime(date: Date) {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function getData() {
  const [
    projects,
    services,
    testimonials,
    gear,
    posts,
    inquiries,
    newInquiries,
    starredInquiries,
    recentInquiries,
    recentActivity,
    activity24h,
    faqs,
    subscribers,
    pendingDeliveries,
    aiCalls24h,
    photoBatches,
    photoBatchPhotos,
  ] = await Promise.all([
    db.project.count(),
    db.service.count(),
    db.testimonial.count(),
    db.gear.count(),
    db.blogPost.count(),
    db.inquiry.count(),
    db.inquiry.count({ where: { status: "NEW" } }),
    db.inquiry.count({ where: { starred: true } }),
    db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.activityLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    db.faq.count(),
    db.subscriber.count({ where: { active: true } }),
    db.projectDelivery.count({ where: { status: { in: ["PENDING", "READY"] } } }),
    db.aiUsage.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    db.photoBatch.count(),
    db.photoBatchItem.count(),
  ]);
  return {
    stats: { projects, services, testimonials, gear, posts, inquiries, newInquiries, starredInquiries, faqs, subscribers },
    recentInquiries,
    recentActivity,
    activity24h,
    pendingDeliveries,
    aiCalls24h,
    photoBatches,
    photoBatchPhotos,
  };
}

export default async function AdminDashboardPage() {
  const { stats, recentInquiries, recentActivity, activity24h, pendingDeliveries, aiCalls24h, photoBatches, photoBatchPhotos } = await getData();

  const cards = [
    { label: "Projects", value: stats.projects, icon: Film, href: "/admin/projects", accent: true },
    { label: "Services", value: stats.services, icon: Briefcase, href: "/admin/services" },
    { label: "Testimonials", value: stats.testimonials, icon: Quote, href: "/admin/testimonials" },
    { label: "Gear Items", value: stats.gear, icon: Camera, href: "/admin/gear" },
    { label: "Journal Posts", value: stats.posts, icon: Newspaper, href: "/admin/journal" },
    { label: "Inquiries", value: stats.inquiries, icon: Inbox, href: "/admin/inquiries", badge: stats.newInquiries, starred: stats.starredInquiries },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Dashboard"
        description="An overview of your studio's content and incoming inquiries."
        action={
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" />
            New Project
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}>
              <Card className="group relative overflow-hidden border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg hover:shadow-black/20">
                {/* hover glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand/0 blur-2xl transition-all duration-500 group-hover:bg-brand/10" />
                <div className="relative flex items-start justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                      c.accent
                        ? "bg-brand text-black"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {c.badge ? (
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
                      {c.badge} new
                    </span>
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                  {"starred" in c && c.starred ? (
                    <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
                      <Star className="h-3 w-3 fill-current" />
                      {c.starred}
                    </span>
                  ) : null}
                </div>
                <p className="relative mt-4 font-display text-3xl font-bold">{c.value}</p>
                <p className="relative mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Secondary mini-stats: activity + faqs + subscribers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/activity"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <History className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold">{activity24h}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Actions in last 24h
          </p>
        </Link>
        <Link
          href="/admin/faqs"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <HelpCircle className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold">{stats.faqs}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Published FAQs
          </p>
        </Link>
        <Link
          href="/admin/subscribers"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <Mail className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold">{stats.subscribers}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Active subscribers
          </p>
        </Link>
      </div>

      {/* Tertiary mini-stats: pending deliveries + AI calls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/projects"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <Package className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold">{pendingDeliveries}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Pending deliveries
          </p>
        </Link>
        <Link
          href="/admin/settings"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <Sparkles className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold">{aiCalls24h}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            AI calls in last 24h
          </p>
        </Link>
      </div>

      {/* AI usage sparkline (7-day mini chart) */}
      <AiUsageSparkline />

      {/* Photo batch stats (only when there are batches) */}
      {photoBatches > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/projects"
            className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <Images className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{photoBatches}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Photo batches
            </p>
          </Link>
          <Link
            href="/admin/projects"
            className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <Images className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{photoBatchPhotos}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Photos in batches
            </p>
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent inquiries */}
        <Card className="border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Inquiries</h2>
            <Link
              href="/admin/inquiries"
              className="text-sm text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recentInquiries.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No inquiries yet.
              </p>
            )}
            {recentInquiries.map((i) => (
              <Link
                key={i.id}
                href={`/admin/inquiries/${i.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-brand/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{i.name}</p>
                    {i.status === "NEW" && (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase text-black">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {i.projectType || "General"} · {i.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-right">
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {statusLabel(i.status)}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
          <div className="mt-5 space-y-2">
            {[
              { href: "/admin/projects/new", label: "Add a project", icon: Film },
              { href: "/admin/journal/new", label: "Write a journal entry", icon: Newspaper },
              { href: "/admin/gear/new", label: "Add gear", icon: Camera },
              { href: "/admin/testimonials/new", label: "Add testimonial", icon: Quote },
              { href: "/admin/faqs/new", label: "Add an FAQ", icon: HelpCircle },
              { href: "/admin/settings", label: "Edit site settings", icon: Sparkles },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3 text-sm transition-colors hover:border-brand/40 hover:bg-background"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-brand" />
                    {a.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              );
            })}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-background/40 p-3 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-brand" />
            Changes publish instantly to your live site.
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
              <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand">
                {activity24h} in last 24h
              </span>
            </div>
            <Link href="/admin/activity" className="text-sm text-brand hover:underline">
              View full log
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            {recentActivity.map((a) => {
              const meta = ACTION_ICON[a.action] ?? { icon: History, cls: "bg-muted text-muted-foreground" };
              const Icon = meta.icon;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3"
                >
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.cls)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {a.summary}
                  </p>
                  <time
                    className="shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground"
                    dateTime={a.createdAt.toISOString()}
                  >
                    {relTime(a.createdAt)}
                  </time>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Analytics */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-10 bg-brand" />
          <span className="label-eyebrow text-brand">Analytics</span>
        </div>
        <AnalyticsCharts />
      </div>
    </div>
  );
}
