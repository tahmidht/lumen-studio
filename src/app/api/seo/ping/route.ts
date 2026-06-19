import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { getSiteConfig } from "@/lib/settings";

/**
 * POST /api/seo/ping — admin-triggered sitemap submission to search engines.
 *
 * Pings Google + Bing's sitemap-submission endpoints with the site's
 * sitemap.xml URL. Returns the status of each ping. Non-fatal — if a ping
 * fails (e.g. no network), the others still run.
 *
 * Requires the public site URL to be set via NEXTAUTH_URL env var.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const config = await getSiteConfig();
    const base =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://lumen.studio";
    const sitemapUrl = `${base}/sitemap.xml`;

    // In a sandboxed dev environment the pings will likely fail (no outbound
    // network or DNS). We attempt them anyway and report whatever we get back.
    const engines = [
      {
        name: "Google",
        url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      },
      {
        name: "Bing",
        url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      },
    ];

    const results = await Promise.all(
      engines.map(async (e) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(e.url, {
            method: "GET",
            signal: controller.signal,
            redirect: "follow",
          });
          clearTimeout(timeout);
          return {
            engine: e.name,
            status: res.status,
            ok: res.ok,
            url: e.url,
          };
        } catch (err) {
          return {
            engine: e.name,
            status: 0,
            ok: false,
            url: e.url,
            error: err instanceof Error ? err.message : "fetch failed",
          };
        }
      })
    );

    await logActivity({
      action: "config",
      entity: "config",
      label: "SEO ping",
      entityId: null,
      summary: `Pinged search engines with sitemap (${results.filter((r) => r.ok).length}/${results.length} ok)`,
      actor: guard.session?.user?.email ?? null,
    });

    return ok({
      sitemapUrl,
      results,
      base,
      siteName: config.siteName,
    });
  } catch (err) {
    return serverError("Failed to ping search engines", err);
  }
}

// silence unused
void fail;
