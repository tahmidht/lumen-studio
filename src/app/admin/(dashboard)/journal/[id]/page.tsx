import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { parseJsonArray } from "@/lib/api";
import { AdminHeader } from "@/components/admin/sidebar";
import { PostForm } from "@/components/admin/post-form";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.blogPost.findUnique({ where: { id } });
  if (!row) notFound();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/journal" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to journal
        </Link>
        <DeleteButton endpoint={`/api/posts/${row.id}`} redirectTo="/admin/journal" />
      </div>
      <AdminHeader title="Edit Post" description={row.title} />
      <PostForm
        initial={{
          id: row.id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt ?? "",
          content: row.content,
          coverImage: row.coverImage ?? "",
          coverImageAlt: row.coverImageAlt ?? "",
          tags: parseJsonArray(row.tags),
          author: row.author ?? "",
          published: row.published,
        }}
      />
    </div>
  );
}
