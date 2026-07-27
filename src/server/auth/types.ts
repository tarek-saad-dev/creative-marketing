import "server-only";

import type { AdminRole } from "@/generated/prisma";

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

const ROLE_RANK: Record<AdminRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

/** True when `role` is at least as privileged as `minimum` (OWNER > ADMIN > EDITOR > VIEWER). */
export function hasRoleAtLeast(role: AdminRole, minimum: AdminRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
