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
  if (!role || !Object.prototype.hasOwnProperty.call(ROLE_RANK,role)) return false;
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

export const teamAssignableRoles=["ADMIN","EDITOR","VIEWER"] as const;
export type TeamAssignableRole=typeof teamAssignableRoles[number];
export function canManageTeam(role:string|null|undefined){return role==="OWNER";}
export function canManageTeamMember(actor:{id:string;role:string},target:{id:string;role:string;deletedAt?:unknown}){return canManageTeam(actor.role)&&actor.id!==target.id&&target.role!=="OWNER"&&!target.deletedAt;}
