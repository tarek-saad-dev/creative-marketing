import "server-only";

import { prisma } from "@/lib/db/prisma";
import { LeadStatus, type Prisma } from "@/generated/prisma";

export const adminLeadListSelect = {
  id: true,
  name: true,
  phone: true,
  projectName: true,
  industry: true,
  status: true,
  source: true,
  utmSource: true,
  createdAt: true,
  updatedAt: true,
  package: { select: { id: true, name: true } },
  assignedAdmin: { select: { id: true, name: true } },
} satisfies Prisma.LeadSelect;

export type AdminLeadListRow = Prisma.LeadGetPayload<{
  select: typeof adminLeadListSelect;
}>;

export type LeadListFilter = {
  status?: LeadStatus;
  search?: string;
  packageId?: string;
  source?: string;
  utmSource?: string;
  from?: Date;
  to?: Date;
  sort?: "createdAt_desc" | "createdAt_asc" | "updatedAt_desc";
  page?: number;
  pageSize?: number;
};

export async function listLeadsForAdmin(options: LeadListFilter = {}): Promise<{
  rows: AdminLeadListRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 25));

  const where: Prisma.LeadWhereInput = {
    ...(options.status ? { status: options.status } : {}),
    ...(options.packageId ? { packageId: options.packageId } : {}),
    ...(options.source
      ? { source: { contains: options.source, mode: "insensitive" } }
      : {}),
    ...(options.utmSource
      ? { utmSource: { contains: options.utmSource, mode: "insensitive" } }
      : {}),
    ...(options.from || options.to
      ? {
          createdAt: {
            ...(options.from ? { gte: options.from } : {}),
            ...(options.to ? { lte: options.to } : {}),
          },
        }
      : {}),
    ...(options.search
      ? {
          OR: [
            { name: { contains: options.search, mode: "insensitive" } },
            { phone: { contains: options.search, mode: "insensitive" } },
            { projectName: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.LeadOrderByWithRelationInput =
    options.sort === "createdAt_asc"
      ? { createdAt: "asc" }
      : options.sort === "updatedAt_desc"
        ? { updatedAt: "desc" }
        : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy,
      select: adminLeadListSelect,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function findLeadByIdForAdmin(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      package: { select: { id: true, name: true } },
      assignedAdmin: { select: { id: true, name: true } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function countLeadsByStatus() {
  return prisma.lead.groupBy({ by: ["status"], _count: { _all: true } });
}

export async function updateLeadStatusRow(id: string, status: LeadStatus) {
  return prisma.lead.update({
    where: { id },
    data: { status },
    select: { id: true, status: true, name: true },
  });
}

export async function updateLeadInternalNoteRow(
  id: string,
  internalNote: string | null
) {
  return prisma.lead.update({
    where: { id },
    data: { internalNote },
    select: { id: true },
  });
}

export async function assignLeadRow(
  id: string,
  assignedAdminId: string | null
) {
  return prisma.lead.update({
    where: { id },
    data: { assignedAdminId },
    select: {
      id: true,
      assignedAdmin: { select: { id: true, name: true } },
    },
  });
}

export async function createLeadEventRow(
  leadId: string,
  type: Prisma.LeadEventCreateInput["type"],
  metadata?: Prisma.InputJsonValue
) {
  return prisma.leadEvent.create({
    data: { leadId, type, metadata },
    select: { id: true },
  });
}
