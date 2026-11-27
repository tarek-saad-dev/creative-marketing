import type { NextAuthConfig } from "next-auth";
import type { AdminRole } from "@/generated/prisma";

/**
 * Edge-safe Auth.js config (no Node/Prisma imports).
 * Full Credentials authorize lives in `src/auth.ts`.
 */
export const authConfig = {
  ...(process.env.VERCEL === "1" ? { useSecureCookies: true } : {}),
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12, // 12 hours
  },
  callbacks: {
    // Explicit middleware owns authentication redirects, using the incoming origin.
    authorized() { return true; },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.credentialVersion=user.credentialVersion;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.credentialVersion=typeof token.credentialVersion === "string" ? token.credentialVersion : undefined;
        session.user.role = (token.role as AdminRole) ?? "VIEWER";
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
