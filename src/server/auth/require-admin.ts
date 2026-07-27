import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { AdminRole } from "@/generated/prisma";
import { findAdminUserById } from "@/server/repositories/admin-user.repository";
import type { AdminUserSafe } from "@/server/repositories/admin-user.repository";

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

const ROLE_RANK: Record<AdminRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function roleAtLeast(role: AdminRole, minimum: AdminRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export async function getCurrentAdmin(): Promise<AdminSessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) return null;

  const dbUser = await findAdminUserById(user.id);
  if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
    return null;
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  };
}

/**
 * Server-side gate for protected admin pages and mutations.
 * Redirects unauthenticated users to login (pages) or throws (mutations).
 */
export async function requireAdmin(options?: {
  minimumRole?: AdminRole;
  redirectToLogin?: boolean;
}): Promise<AdminSessionUser> {
  const admin = await getCurrentAdmin();
  const redirectToLogin = options?.redirectToLogin ?? true;

  if (!admin) {
    if (redirectToLogin) {
      redirect("/admin/login");
    }
    throw new Error("UNAUTHORIZED");
  }

  if (options?.minimumRole && !roleAtLeast(admin.role, options.minimumRole)) {
    if (redirectToLogin) {
      redirect("/admin?error=forbidden");
    }
    throw new Error("FORBIDDEN");
  }

  return admin;
}

export async function requireRole(
  minimumRole: AdminRole
): Promise<AdminSessionUser> {
  // Pages must redirect; Server Actions use withAdminMutation instead.
  return requireAdmin({ minimumRole, redirectToLogin: true });
}

export type { AdminUserSafe };
