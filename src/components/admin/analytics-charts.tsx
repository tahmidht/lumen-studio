"use client";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, Activity, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type Analytics = {
  inquiryTrend: { date: string; label: string; count: number }[];
  projectsByCategory: { category: string; raw: string; count: number }[];
  inquiryStatus: { status: string; count: number }[];
  publishedVsDraft: { published: number; draft: number; featured: number };
  totalInquiries: number;
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "var(--brand)",
  READ: "#6b7280",
  REPLIED: "#10b981",
  ARCHIVED: "#374151",
};

const CATEGORY_COLORS = [
  "#E8B547",
  "#5B8FB9",
  "#B85C8E",
  "#7C9885",
  "#D97757",
  "#9F7AEA",
  "#C2410C",
  "#0891b2",
];

export function AnalyticsCharts() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
  });

  if (isLoading || !data) {
    return (
      <Card className="flex h-64 items-center justify-center border-border bg-card">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  const hasInquiries = data.totalInquiries > 0;
  const hasProjects = data.projectsByCategory.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Inquiry trend */}
      <Card className="border-border bg-card p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              <h3 className="font-display text-base font-semibold">
                Inquiries — last 14 days
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {data.totalInquiries} total · {data.inquiryTrend.reduce((a, b) => a + b.count, 0)} in this window
            </p>
          </div>
        </div>
        <div className="mt-5 h-56">
          {hasInquiries || data.inquiryTrend.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.inquiryTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--brand)"
                  strokeWidth={2}
                  fill="url(#inqGrad)"
                  name="Inquiries"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="No inquiries yet. They'll appear here as they come in." />
          )}
        </div>
      </Card>

      {/* Inquiry status donut */}
      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand" />
          <h3 className="font-display text-base font-semibold">Inquiry status</h3>
        </div>
        <div className="mt-4 h-48">
          {hasInquiries ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.inquiryStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {data.inquiryStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "var(--muted)"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="No data yet." />
          )}
        </div>
      </Card>

      {/* Projects by category */}
      <Card className="border-border bg-card p-6 lg:col-span-2">
        <div className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-brand" />
          <h3 className="font-display text-base font-semibold">
            Projects by category
          </h3>
        </div>
        <div className="mt-5 h-56">
          {hasProjects ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projectsByCategory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--brand)", fillOpacity: 0.08 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Projects">
                  {data.projectsByCategory.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="No projects yet." />
          )}
        </div>
      </Card>

      {/* Publish state */}
      <Card className="border-border bg-card p-6">
        <h3 className="font-display text-base font-semibold">Publish state</h3>
        <div className="mt-5 space-y-4">
          <StatRow label="Published" value={data.publishedVsDraft.published} color="var(--brand)" />
          <StatRow label="Drafts" value={data.publishedVsDraft.draft} color="#6b7280" />
          <StatRow label="Featured" value={data.publishedVsDraft.featured} color="#B85C8E" />
        </div>
        <div className="mt-6 rounded-lg border border-border bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Total projects</p>
          <p className="mt-1 font-display text-3xl font-bold text-brand">
            {data.publishedVsDraft.published + data.publishedVsDraft.draft}
          </p>
        </div>
      </Card>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-display text-lg font-semibold">{value}</span>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}
