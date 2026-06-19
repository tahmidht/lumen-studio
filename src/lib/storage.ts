/**
 * Storage adapter — abstraction layer for file uploads.
 *
 * Supports two backends:
 *   1. local  — writes to public/uploads/ (default, zero-config)
 *   2. s3     — writes to an S3-compatible bucket (AWS S3, Cloudflare R2, MinIO)
 *
 * The backend is selected via the STORAGE_DRIVER env var:
 *   STORAGE_DRIVER=local  (default)
 *   STORAGE_DRIVER=s3     (requires S3_* env vars)
 *
 * When S3 is configured, uploads go to the bucket + the public URL is returned.
 * When local, uploads go to public/uploads/ + the relative URL is returned.
 *
 * This keeps the upload API route clean + makes the project multi-instance
 * ready (S3) while remaining zero-config for self-hosters (local).
 */
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export type StorageResult = {
  url: string; // public URL to the file
  key: string; // storage key (filename for local, object key for S3)
  size: number; // file size in bytes
  contentType: string;
};

export type StorageDriver = "local" | "s3";

/** Detect the configured storage driver. */
export function getStorageDriver(): StorageDriver {
  const driver = process.env.STORAGE_DRIVER || "local";
  return driver === "s3" ? "s3" : "local";
}

/** Check whether S3 is properly configured. */
export function isS3Configured(): boolean {
  return !!(
    process.env.S3_ENDPOINT &&
    process.env.S3_BUCKET &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  );
}

// ─── Local storage ──────────────────────────────────────────────────────

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function saveLocal(
  buffer: Buffer,
  contentType: string,
  ext: string
): Promise<StorageResult> {
  // Ensure the uploads directory exists
  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

  // Generate a unique filename: <timestamp>-<random>.ext
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const filePath = path.join(LOCAL_UPLOAD_DIR, filename);

  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    key: filename,
    size: buffer.length,
    contentType,
  };
}

// ─── S3 storage ─────────────────────────────────────────────────────────

/**
 * Save to an S3-compatible bucket using the standard S3 REST API.
 * No AWS SDK dependency — uses native fetch with SigV4-style auth.
 *
 * For Cloudflare R2: set S3_ENDPOINT to your R2 API URL + S3_BUCKET.
 * For AWS S3: set S3_ENDPOINT to https://s3.<region>.amazonaws.com + S3_BUCKET + S3_REGION.
 */
async function saveS3(
  buffer: Buffer,
  contentType: string,
  ext: string
): Promise<StorageResult> {
  if (!isS3Configured()) {
    throw new Error("S3 storage selected but not configured (missing S3_* env vars)");
  }

  const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, "");
  const bucket = process.env.S3_BUCKET!;
  const region = process.env.S3_REGION || "auto";
  const accessKeyId = process.env.S3_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY!;
  const publicUrlBase = process.env.S3_PUBLIC_URL_BASE; // e.g. https://cdn.yourstudio.com

  // Generate a unique object key
  const key = `uploads/${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;

  // S3 REST API PUT — simplified (no SigV4 for now; many S3-compatible services
  // support presigned URLs or public-write buckets. For production, use a
  // presigned-URL flow or the AWS SDK.)
  //
  // NOTE: This is a scaffold. For production S3, swap in @aws-sdk/client-s3
  // or generate a presigned PUT URL client-side.
  const url = `${endpoint}/${bucket}/${key}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buffer.length),
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`S3 upload failed (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }

  // Public URL: use S3_PUBLIC_URL_BASE if set (e.g. CDN), else the endpoint
  const publicUrl = publicUrlBase
    ? `${publicUrlBase.replace(/\/$/, "")}/${key}`
    : `${endpoint}/${bucket}/${key}`;

  return {
    url: publicUrl,
    key,
    size: buffer.length,
    contentType,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Save a file to the configured storage backend.
 * Returns the public URL + metadata.
 */
export async function saveFile(
  buffer: Buffer,
  contentType: string,
  ext: string
): Promise<StorageResult> {
  const driver = getStorageDriver();
  if (driver === "s3" && isS3Configured()) {
    return saveS3(buffer, contentType, ext);
  }
  return saveLocal(buffer, contentType, ext);
}

/**
 * Delete a file from the configured storage backend.
 * Best-effort — failures are logged but don't throw.
 */
export async function deleteFile(key: string): Promise<void> {
  const driver = getStorageDriver();
  try {
    if (driver === "s3" && isS3Configured()) {
      const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, "");
      const bucket = process.env.S3_BUCKET!;
      const url = `${endpoint}/${bucket}/${key}`;
      await fetch(url, { method: "DELETE" });
    } else {
      const filePath = path.join(LOCAL_UPLOAD_DIR, key);
      await fs.unlink(filePath);
    }
  } catch (err) {
    console.error("[storage] failed to delete file", key, err);
  }
}

/** Get the file extension from a content type. */
export function extFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "application/pdf": ".pdf",
  };
  return map[contentType] || "";
}
