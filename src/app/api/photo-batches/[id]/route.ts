import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { deleteFile } from "@/lib/storage";


/** DELETE /api/photo-batches/[id] — delete a batch + all its photos + faces. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const batch = await db.photoBatch.findUnique({ where: { id } });
    if (!batch) return fail("Photo batch not found", 404);

    // Delete all photos from storage
    const photos = await db.photoBatchItem.findMany({
      where: { batchId: id },
      select: { storageKey: true },
    });
    for (const p of photos) {
      await deleteFile(p.storageKey);
    }

    // Delete DB records (faces cascade via batchId index — delete explicitly)
    await db.photoFace.deleteMany({ where: { batchId: id } });
    await db.photoBatchItem.deleteMany({ where: { batchId: id } });
    await db.photoBatchToken.deleteMany({ where: { batchId: id } });
    await db.photoBatch.delete({ where: { id } });

    await logActivity({
      action: "delete",
      entity: "project",
      label: batch.title,
      entityId: id,
      summary: `Deleted photo batch “${batch.title}” (${photos.length} photos)`,
      actor: guard.session?.user?.email ?? null,
    });

    return ok({ id });
  } catch (err) {
    return serverError("Failed to delete photo batch", err);
  }
}
