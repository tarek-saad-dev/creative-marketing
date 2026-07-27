import "server-only";

import type { Prisma } from "@/generated/prisma";
import { createAuditLogEntry } from "@/server/repositories/admin-audit.repository";

/**
 * Central place to record admin mutations.
 *
 * Safety rules (see docs/phase-5-audit-security.md):
 *  - Never pass passwords, hashes, tokens, or DB connection strings.
 *  - Never pass a full Lead payload — only status/fields that changed.
 *  - Keep metadata small and JSON-serializable.
 */
export async function logAdminAction(input: {
  adminUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await createAuditLogEntry(input);
}
