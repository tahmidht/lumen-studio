import Link from "next/link";
import { Plus, Newspaper } from "lucide-react";
import { db } from "@/lib/db";
import { parseJsonArray } from "@/lib/api";
import { AdminHeader } from "@/components/admin/sidebar";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const rows = await db.blogPost.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Journal"
        description="Behind-the-scenes stories and articles."
        action={
          <Link href="/admin/journal/new" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110">
            <Plus className="h-4 w-4" /> New Post
          </Link>
        }
      />

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed py-12 text-center">
          <Newspaper className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-lg font-semibold">No posts yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((p) => {
            const tags = parseJsonArray(p.tags);
            return (
              <Card key={p.id} className="flex items-center gap-4 border-border bg-card p-4">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-background">
                  {p.coverImage ? (
                     
                    <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/30">
                      <Newspaper className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-base font-semibold">{p.title}</h3>
                    {!p.published && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">Draft</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {p.excerpt || "No excerpt"}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "Unscheduled"}
                    {tags[0] && <span>· {tags[0]}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/admin/journal/${p.id}`} className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-brand hover:text-brand">
                    Edit
                  </Link>
                  <DuplicateButton
                    endpoint={`/api/posts/${p.id}/duplicate`}
                    editHref="/admin/journal"
                  />
                  <DeleteButton endpoint={`/api/posts/${p.id}`} size="sm" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
