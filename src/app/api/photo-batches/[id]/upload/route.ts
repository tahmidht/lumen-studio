import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { saveFile, extFromContentType } from "@/lib/storage";

/**
 * POST /api/photo-batches/[id]/upload — upload a single photo with pre-extracted
 * face descriptors (detected browser-side).
 *
 * Body (multipart/form-data):
 *   file:        the image file
 *   descriptors: JSON string of number[][] (array of 128-dim descriptors, one per face)
 *   boxes:       JSON string of {x,y,width,height}[] (face bounding boxes, optional)
 *
 * The server saves the photo via the storage adapter + stores the descriptors.
 * Face detection runs in the browser — the server never runs face-api.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const { id } = await params;
    const batch = await db.photoBatch.findUnique({ where: { id } });
    if (!batch) return fail("Photo batch not found", 404);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return fail("No file provided", 422);
    }
    if (file.size > 20 * 1024 * 1024) {
      return fail("File too large (max 20MB)", 413);
    }

    const descriptorsRaw = formData.get("descriptors") as string | null;
    const boxesRaw = formData.get("boxes") as string | null;

    let descriptors: number[][] = [];
    let boxes: { x: number; y: number; width: number; height: number }[] = [];
    try {
      if (descriptorsRaw) descriptors = JSON.parse(descriptorsRaw);
      if (boxesRaw) boxes = JSON.parse(boxesRaw);
    } catch {
      return fail("Invalid descriptors/boxes JSON", 422);
    }

    // Save the photo via the storage adapter
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extFromContentType(file.type) || ".jpg";
    const stored = await saveFile(buffer, file.type, ext);

    // Create the photo record
    const photo = await db.photoBatchItem.create({
      data: {
        batchId: id,
        url: stored.url,
        storageKey: stored.key,
        faceCount: descriptors.length,
        processed: true,
      },
    });

    // Store face descriptors (tiny — 128 floats each)
    if (descriptors.length > 0) {
      await db.photoFace.createMany({
        data: descriptors.map((desc, i) => ({
          photoId: photo.id,
          batchId: id,
          descriptor: JSON.stringify(desc),
          x: boxes[i]?.x ?? null,
          y: boxes[i]?.y ?? null,
          width: boxes[i]?.width ?? null,
          height: boxes[i]?.height ?? null,
        })),
      });
    }

    // Update batch counts
    await db.photoBatch.update({
      where: { id },
      data: {
        photoCount: { increment: 1 },
        faceCount: { increment: descriptors.length },
      },
    });

    return ok({ photoId: photo.id, url: stored.url, faceCount: descriptors.length }, 201);
  } catch (err) {
    return serverError("Failed to upload photo", err);
  }
}
