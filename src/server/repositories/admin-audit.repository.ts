import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma";

export const adminAuditLogSelect = {
  id: true,
  adminUserId: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  createdAt: true,
  adminUser: {
    select: { id: true, name: true, email: true, role: true },
  },
} satisfies Prisma.AdminAuditLogSelect;

export type AdminAuditLogRow = Prisma.AdminAuditLogGetPayload<{
  select: typeof adminAuditLogSelect;
}>;

export async function createAuditLogEntry(input: {
  adminUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      adminUserId: input.adminUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: input.metadata,
    },
  });
}

export type AuditLogFilter = {
  entityType?: string;
  adminUserId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
};

export async function listAuditLogs(filter: AuditLogFilter = {}): Promise<{
  rows: AdminAuditLogRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const requestedPage=Number.isSafeInteger(filter.page)&&Number(filter.page)>0?Math.min(Number(filter.page),100000):1;
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 30));

  const where: Prisma.AdminAuditLogWhereInput = {
    ...(filter.entityType ? { entityType: filter.entityType } : {}),
    ...(filter.adminUserId ? { adminUserId: filter.adminUserId } : {}),
    ...(filter.action
      ? { action: { contains: filter.action, mode: "insensitive" } }
      : {}),
    ...(filter.from || filter.to
      ? {
          createdAt: {
            ...(filter.from ? { gte: filter.from } : {}),
            ...(filter.to ? { lte: filter.to } : {}),
          },
        }
      : {}),
  };

  const total=await prisma.adminAuditLog.count({where});
  const page=Math.min(requestedPage,Math.max(1,Math.ceil(total/pageSize)));
  const rows=await prisma.adminAuditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" },{id:"desc"}],
      select: adminAuditLogSelect,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

  return { rows, total, page, pageSize };
}

export async function countAuditLogEntries(): Promise<number> {
  return prisma.adminAuditLog.count();
}

export async function listDistinctAuditEntityTypes(): Promise<string[]> {
  const rows = await prisma.adminAuditLog.findMany({
    distinct: ["entityType"],
    select: { entityType: true },
    orderBy: { entityType: "asc" },
  });
  return rows.map(row => row.entityType);
}
