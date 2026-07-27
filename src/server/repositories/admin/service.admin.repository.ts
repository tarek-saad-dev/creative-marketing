import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma, ServiceCategory } from "@/generated/prisma";

export const adminServiceSelect = {
  id: true,
  slug: true,
  nameAr: true,
  nameEn: true,
  category: true,
  summaryAr: true,
  summaryEn: true,
  descriptionAr: true,
  descriptionEn: true,
  icon: true,
  imageUrl: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  _count: { select: { projectServices: true } },
} satisfies Prisma.ServiceSelect;

export type AdminServiceRow = Prisma.ServiceGetPayload<{
  select: typeof adminServiceSelect;
}>;

export async function listServicesForAdmin(): Promise<AdminServiceRow[]> {
  return prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
    select: adminServiceSelect,
  });
}

export async function findServiceByIdForAdmin(
  id: string
): Promise<AdminServiceRow | null> {
  return prisma.service.findUnique({
    where: { id },
    select: adminServiceSelect,
  });
}

export async function findServiceBySlugForAdmin(
  slug: string
): Promise<{ id: string } | null> {
  return prisma.service.findUnique({ where: { slug }, select: { id: true } });
}

export type ServiceWriteInput = {
  slug: string;
  nameAr: string;
  nameEn: string;
  category: ServiceCategory;
  summaryAr: string;
  summaryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
};

export async function createServiceAdminRow(input: ServiceWriteInput) {
  return prisma.service.create({
    data: input,
    select: { id: true, slug: true },
  });
}

export async function updateServiceAdminRow(
  id: string,
  input: ServiceWriteInput
) {
  return prisma.service.update({
    where: { id },
    data: input,
    select: { id: true, slug: true },
  });
}

export async function setServiceActive(id: string, isActive: boolean) {
  return prisma.service.update({
    where: { id },
    data: { isActive },
    select: { id: true, slug: true },
  });
}

export async function softDeleteServiceRow(id: string) {
  return prisma.service.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
    select: { id: true, slug: true },
  });
}

/** Swap displayOrder with the neighbor in the same category. */
export async function swapServiceDisplayOrder(
  id: string,
  direction: "up" | "down"
) {
  const current = await prisma.service.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, category: true, displayOrder: true },
  });
  if (!current) throw new Error("الخدمة غير موجودة");

  const neighbor = await prisma.service.findFirst({
    where: {
      deletedAt: null,
      category: current.category,
      displayOrder:
        direction === "up"
          ? { lt: current.displayOrder }
          : { gt: current.displayOrder },
    },
    orderBy: {
      displayOrder: direction === "up" ? "desc" : "asc",
    },
    select: { id: true, displayOrder: true },
  });

  if (!neighbor) return { id: current.id, moved: false as const };

  await prisma.$transaction([
    prisma.service.update({
      where: { id: current.id },
      data: { displayOrder: neighbor.displayOrder },
    }),
    prisma.service.update({
      where: { id: neighbor.id },
      data: { displayOrder: current.displayOrder },
    }),
  ]);

  return { id: current.id, moved: true as const };
}
