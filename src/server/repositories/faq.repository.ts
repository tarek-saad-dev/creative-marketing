import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function findActiveFaqs() {
  return prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      slug: true,
      question: true,
      answer: true,
      category: true,
      displayOrder: true,
    },
  });
}
