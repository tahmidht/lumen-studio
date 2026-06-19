/**
 * Generic admin-guard wrapper for API route handlers.
 * Returns a 401 JSON response if the caller is not authenticated.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdminApi() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      session: null,
      deny: () =>
        NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 }
        ),
    };
  }
  return { session, deny: null };
}
