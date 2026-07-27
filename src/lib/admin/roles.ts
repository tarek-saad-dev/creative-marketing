/**
 * Client-safe role rank helpers (no Prisma / server-only imports).
 */
export type SimpleAdminRole = "VIEWER" | "EDITOR" | "ADMIN" | "OWNER";

const ROLE_RANK: Record<SimpleAdminRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function roleAtLeast(
  role: string | null | undefined,
  minimum: SimpleAdminRole
): boolean {
  if (!role || !(role in ROLE_RANK)) return false;
  return ROLE_RANK[role as SimpleAdminRole] >= ROLE_RANK[minimum];
}

/** Content mutations (projects, services, testimonials, logos, FAQs, draft packages). */
export function canEditContent(role: string | null | undefined): boolean {
  return roleAtLeast(role, "EDITOR");
}

/** Commercial + settings mutations (packages publish, offers, site settings). */
export function canEditCommercial(role: string | null | undefined): boolean {
  return roleAtLeast(role, "ADMIN");
}
