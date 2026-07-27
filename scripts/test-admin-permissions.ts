/**
 * Permission matrix smoke tests. Avoids server-only imports.
 */
import { AdminRole, LeadStatus } from "../src/generated/prisma";

const ROLE_RANK: Record<AdminRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

function hasRoleAtLeast(role: AdminRole, minimum: AdminRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

const ALLOWED: Record<LeadStatus, LeadStatus[]> = {
  NEW: [LeadStatus.CONTACTED, LeadStatus.ARCHIVED],
  CONTACTED: [LeadStatus.QUALIFIED, LeadStatus.ARCHIVED],
  QUALIFIED: [LeadStatus.WON, LeadStatus.LOST, LeadStatus.ARCHIVED],
  WON: [LeadStatus.ARCHIVED],
  LOST: [LeadStatus.ARCHIVED],
  ARCHIVED: [],
};

function isLeadTransitionAllowed(
  from: LeadStatus,
  to: LeadStatus,
  allowCorrection: boolean
): boolean {
  if (from === to) return false;
  if (ALLOWED[from]?.includes(to)) return true;
  return allowCorrection;
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function main() {
  assert(hasRoleAtLeast(AdminRole.OWNER, AdminRole.ADMIN), "OWNER >= ADMIN");
  assert(hasRoleAtLeast(AdminRole.ADMIN, AdminRole.EDITOR), "ADMIN >= EDITOR");
  assert(
    !hasRoleAtLeast(AdminRole.VIEWER, AdminRole.EDITOR),
    "VIEWER < EDITOR"
  );
  assert(!hasRoleAtLeast(AdminRole.EDITOR, AdminRole.ADMIN), "EDITOR < ADMIN");

  assert(
    isLeadTransitionAllowed(LeadStatus.NEW, LeadStatus.CONTACTED, false),
    "NEW→CONTACTED allowed"
  );
  assert(
    !isLeadTransitionAllowed(LeadStatus.NEW, LeadStatus.WON, false),
    "NEW→WON blocked without correction"
  );
  assert(
    isLeadTransitionAllowed(LeadStatus.NEW, LeadStatus.WON, true),
    "NEW→WON allowed with correction"
  );
  assert(
    isLeadTransitionAllowed(LeadStatus.QUALIFIED, LeadStatus.ARCHIVED, false),
    "QUALIFIED→ARCHIVED allowed"
  );

  console.log("admin:test-permissions passed");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
