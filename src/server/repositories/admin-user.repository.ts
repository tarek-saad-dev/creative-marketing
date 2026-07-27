import "server-only";

import { prisma } from "@/lib/db/prisma";
import { AdminRole, type Prisma } from "@/generated/prisma";

/**
 * Public-safe admin user shape — never includes `passwordHash`.
 * Use this type/select for anything that could reach a Client Component
 * (React Query cache, JSON responses, etc.).
 */
export const adminUserSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.AdminUserSelect;

export type AdminUserSafe = Prisma.AdminUserGetPayload<{
  select: typeof adminUserSafeSelect;
}>;

/**
 * Auth-only lookup — includes `passwordHash`. Must never be imported outside
 * `src/auth.ts` / the Credentials provider's `authorize()` callback.
 */
export async function findAdminUserForAuth(email: string) {
  return prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
      deletedAt: true,
    },
  });
}

export async function findAdminUserById(
  id: string
): Promise<AdminUserSafe | null> {
  return prisma.adminUser.findUnique({
    where: { id },
    select: adminUserSafeSelect,
  });
}

export async function findAdminUserByEmail(
  email: string
): Promise<AdminUserSafe | null> {
  return prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: adminUserSafeSelect,
  });
}

export async function listAdminUsers(
  options: { includeInactive?: boolean } = {}
): Promise<AdminUserSafe[]> {
  return prisma.adminUser.findMany({
    where: options.includeInactive ? {} : { deletedAt: null },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: adminUserSafeSelect,
  });
}

export async function countActiveAdmins(): Promise<number> {
  return prisma.adminUser.count({
    where: { isActive: true, deletedAt: null },
  });
}

export async function countAdminsByRole() {
  return prisma.adminUser.groupBy({
    by: ["role"],
    where: { deletedAt: null },
    _count: { _all: true },
    orderBy: { role: "asc" },
  });
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
}): Promise<AdminUserSafe> {
  return prisma.adminUser.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
    },
    select: adminUserSafeSelect,
  });
}

export async function touchAdminLastLogin(id: string): Promise<void> {
  await prisma.adminUser.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

export async function updateAdminUserRole(
  id: string,
  role: AdminRole
): Promise<AdminUserSafe> {
  return prisma.adminUser.update({
    where: { id },
    data: { role },
    select: adminUserSafeSelect,
  });
}

export async function setAdminUserActive(
  id: string,
  isActive: boolean
): Promise<AdminUserSafe> {
  return prisma.adminUser.update({
    where: { id },
    data: { isActive },
    select: adminUserSafeSelect,
  });
}

/** Soft-delete only — admin accounts are deactivated, never hard-deleted. */
export async function softDeleteAdminUser(id: string): Promise<AdminUserSafe> {
  return prisma.adminUser.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
    select: adminUserSafeSelect,
  });
}
