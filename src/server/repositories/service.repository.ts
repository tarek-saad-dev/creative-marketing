import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function findActiveServices() {
  return prisma.service.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ displayOrder: "asc" }, { category: "asc" }],
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameEn: true,
      category: true,
      summaryAr: true,
      summaryEn: true,
      icon: true,
      displayOrder: true,
    },
  });
}
