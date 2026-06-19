import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, serverError } from "@/lib/api";
import { getUsageStats } from "@/lib/ai/usage";

/** GET /api/ai/usage — admin-only aggregate usage stats for the Settings → AI tab. */
export async function GET(_req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const stats = await getUsageStats();
    return ok(stats);
  } catch (err) {
    return serverError("Failed to load AI usage stats", err);
  }
}
