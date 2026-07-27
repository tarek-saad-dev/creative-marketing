import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import {
  findAdminUserForAuth,
  touchAdminLastLogin,
} from "@/server/repositories/admin-user.repository";
import { verifyPassword } from "@/server/auth/password";
import { logAdminAction } from "@/server/services/admin-audit.service";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Generic message — never reveal whether email exists. */
const INVALID_LOGIN = "بيانات الدخول غير صحيحة.";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.trim().toLowerCase();
        // Extension point: login rate limiting (IP/email) can wrap this block.
        const admin = await findAdminUserForAuth(email);

        if (!admin || !admin.isActive || admin.deletedAt) {
          return null;
        }

        const valid = await verifyPassword(
          parsed.data.password,
          admin.passwordHash
        );
        if (!valid) {
          return null;
        }

        await touchAdminLastLogin(admin.id);
        await logAdminAction({
          adminUserId: admin.id,
          action: "LOGIN_SUCCESS",
          entityType: "AdminUser",
          entityId: admin.id,
          metadata: { email: admin.email },
        });

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
});

export { INVALID_LOGIN };
