"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Film,
  Briefcase,
  Quote,
  Camera,
  Newspaper,
  Inbox,
  Settings,
  UserCog,
  Award,
  Mail,
  LogOut,
  ExternalLink,
  Menu,
  X,
  HelpCircle,
  History,
  Clapperboard,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: Film },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/awards", label: "Awards", icon: Award },
  { href: "/admin/gear", label: "Gear", icon: Camera },
  { href: "/admin/journal", label: "Journal", icon: Newspaper },
  { href: "/admin/process", label: "Process", icon: Clapperboard },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/activity", label: "Activity", icon: History },
  { href: "/admin/about", label: "About", icon: Settings },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/account", label: "Account", icon: UserCog },
];

export function AdminSidebar({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand" />
          <span className="font-display text-sm font-bold tracking-[0.2em]">
            {siteName}
          </span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
          aria-label="Toggle sidebar"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="font-display text-base font-bold tracking-[0.2em]">
              {siteName}
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scroll-cinema">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-brand text-black font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-border p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { Button };
