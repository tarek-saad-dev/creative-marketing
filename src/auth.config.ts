import type { NextAuthConfig } from "next-auth";
import type { AdminRole } from "@/generated/prisma";

/**
 * Edge-safe Auth.js config (no Node/Prisma imports).
 * Full Credentials authorize lives in `src/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12, // 12 hours
  },
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      if (!pathname.startsWith("/admin")) return true;
      if (pathname === "/admin/login") return true;
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as AdminRole) ?? "VIEWER";
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
