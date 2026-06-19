import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { saveFile, extFromContentType, getStorageDriver, isS3Configured } from "@/lib/storage";
import { logActivity } from "@/lib/activity";

/**
 * POST /api/upload — admin-only file upload.
 * Uses the storage adapter (local filesystem or S3-compatible bucket).
 *
 * Accepts multipart/form-data with a "file" field.
 * Returns { url, key, size, contentType }.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return fail("No file provided", 422);
    }

    // 20MB max
    if (file.size > 20 * 1024 * 1024) {
      return fail("File too large (max 20MB)", 413);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extFromContentType(file.type) || path_ext(file.name);
    const result = await saveFile(buffer, file.type, ext);

    await logActivity({
      action: "create",
      entity: "config",
      label: result.key,
      entityId: null,
      summary: `Uploaded file ${result.key} (${formatSize(result.size)}) via ${getStorageDriver()} storage`,
      actor: guard.session?.user?.email ?? null,
    });

    return ok(result, 201);
  } catch (err) {
    return serverError("Upload failed", err);
  }
}

/** GET /api/upload/status — admin-only, returns the current storage driver config. */
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  return ok({
    driver: getStorageDriver(),
    s3Configured: isS3Configured(),
  });
}

// helpers
function path_ext(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx) : "";
}
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
