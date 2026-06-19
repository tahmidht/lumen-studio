"use server";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/** Returns the current session or null. Use in server components / route handlers. */
export async function getSession() {
  return getServerSession(authOptions);
}

/** Throws to the admin login page if unauthenticated. Use in admin server components. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
