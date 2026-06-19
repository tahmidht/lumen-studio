import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import { SiteShell } from "@/components/site/site-shell";
import { PhotoBatchClient } from "@/components/site/photo-batch-client";
import type { Metadata } from "next";

export const revalidate = 0;

type Params = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const row = await db.photoBatchToken.findUnique({ where: { token } });
  if (!row || row.revoked) return { title: "Photos not found" };
  const batch = await db.photoBatch.findUnique({
    where: { id: row.batchId },
    select: { title: true },
  });
  if (!batch) return { title: "Photos not found" };
  return {
    title: `${batch.title} — Find your photos`,
    description: `Find your photos from ${batch.title}. Take a selfie to see only your photos.`,
    robots: { index: false, follow: false },
  };
}

export default async function PhotoBatchPage({ params }: Params) {
  const { token } = await params;
  const config = await getSiteConfig();

  const row = await db.photoBatchToken.findUnique({ where: { token } });
  if (!row || row.revoked) notFound();

  const batch = await db.photoBatch.findUnique({
    where: { id: row.batchId },
    select: { id: true, title: true, photoCount: true, faceCount: true },
  });
  if (!batch) notFound();

  if (row.expiresAt && row.expiresAt < new Date()) {
    return (
      <SiteShell config={config}>
        <section className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="max-w-md text-center">
            <h1 className="font-display text-2xl font-bold">Link expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This photo link expired. Contact the studio for a new link.
            </p>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell config={config}>
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand" />
            <span className="label-eyebrow text-brand">Find your photos</span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl">
            {batch.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            {batch.photoCount} photos · {batch.faceCount} faces detected.
            Take a selfie or upload a photo of yourself to find your pictures.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <PhotoBatchClient
            token={token}
            batchTitle={batch.title}
            requiresPassphrase={!!row.passphrase}
          />
        </div>
      </section>
    </SiteShell>
  );
}
