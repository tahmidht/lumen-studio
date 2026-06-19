import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;
        const ok = verifyPassword(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
      }
      // If the flag is still true, re-check the DB — the admin may have just
      // changed their password via the setup wizard (the JWT doesn't auto-update).
      // This adds a DB query ONLY when mustChangePassword is true (rare — only
      // during the first-run setup flow). After it's cleared, no extra queries.
      if (token.mustChangePassword && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
          select: { mustChangePassword: true },
        });
        if (dbUser) {
          token.mustChangePassword = dbUser.mustChangePassword;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { mustChangePassword?: boolean }).mustChangePassword =
          token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "lumen-dev-secret-change-me-in-production",
};

export type AdminSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
};
