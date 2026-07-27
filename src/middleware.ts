import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Edge middleware uses the edge-safe config only (no Credentials/Prisma).
 * Session JWT is validated here; full authorize stays in Node `src/auth.ts`.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
