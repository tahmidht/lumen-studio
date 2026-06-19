import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — public uptime-monitoring endpoint.
 * Returns DB connectivity + config load status + version info.
 * Intentionally public (no auth) so external monitors can poll it.
 *
 * Response shape:
 *   { ok: true, status: "healthy"|"degraded", checks: {...}, timestamp, version }
 */
export async function GET() {
  const start = Date.now();
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};

  // 1. DB connectivity — run a trivial query
  try {
    const t0 = Date.now();
    await db.$queryRaw`SELECT 1`;
    checks.db = { ok: true, ms: Date.now() - t0 };
  } catch (err) {
    checks.db = {
      ok: false,
      error: err instanceof Error ? err.message : "db query failed",
    };
  }

  // 2. Site config load
  try {
    const t0 = Date.now();
    await getSiteConfig();
    checks.config = { ok: true, ms: Date.now() - t0 };
  } catch (err) {
    checks.config = {
      ok: false,
      error: err instanceof Error ? err.message : "config load failed",
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const status = allOk ? "healthy" : "degraded";

  return NextResponse.json(
    {
      ok: allOk,
      status,
      checks,
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - start,
      version: process.env.npm_package_version || "0.2.0",
      environment: process.env.NODE_ENV || "development",
    },
    {
      status: allOk ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
