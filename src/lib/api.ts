/** Small helpers shared across API route handlers. */
import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, details },
    { status }
  );
}

/** Standardised JSON error for uncaught exceptions. */
export function serverError(message: string, err?: unknown) {
  console.error("[api:error]", message, err);
  return NextResponse.json(
    { ok: false, error: message },
    { status: 500 }
  );
}

/** Slugify a title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Ensure a slug is unique against a lookup function. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  ignoreSlug?: string
): Promise<string> {
  let slug = slugify(base) || "untitled";
  let i = 1;
  while (true) {
    if (slug === ignoreSlug) break;
    const taken = await exists(slug);
    if (!taken) break;
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export type BtsPhoto = { image: string; alt: string; caption?: string };

/** Parse a JSON string of { image, alt, caption? }[] into a typed array. */
export function parseBtsGallery(raw: string | null | undefined): BtsPhoto[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v
      .filter(
        (x): x is BtsPhoto =>
          !!x &&
          typeof x === "object" &&
          typeof (x as BtsPhoto).image === "string"
      )
      .map((x) => ({
        image: String(x.image),
        alt: typeof x.alt === "string" ? x.alt : "",
        ...(typeof x.caption === "string" && x.caption ? { caption: x.caption } : {}),
      }));
  } catch {
    return [];
  }
}
