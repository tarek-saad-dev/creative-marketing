import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function listFaqsForAdmin() {
  return prisma.fAQ.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function findFaqBySlugForAdmin(slug: string) {
  return prisma.fAQ.findUnique({ where: { slug }, select: { id: true } });
}

export type FaqWriteInput = {
  slug: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  displayOrder: number;
};

export async function createFaqRow(input: FaqWriteInput) {
  return prisma.fAQ.create({ data: input, select: { id: true } });
}

export async function updateFaqRow(id: string, input: FaqWriteInput) {
  return prisma.fAQ.update({
    where: { id },
    data: input,
    select: { id: true },
  });
}

export async function deleteFaqRow(id: string) {
  return prisma.fAQ.delete({ where: { id }, select: { id: true } });
}

export async function swapFaqDisplayOrder(
  id: string,
  direction: "up" | "down"
) {
  const current = await prisma.fAQ.findUnique({
    where: { id },
    select: { id: true, displayOrder: true },
  });
  if (!current) throw new Error("السؤال غير موجود");

  const neighbor = await prisma.fAQ.findFirst({
    where: {
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
    prisma.fAQ.update({
      where: { id: current.id },
      data: { displayOrder: neighbor.displayOrder },
    }),
    prisma.fAQ.update({
      where: { id: neighbor.id },
      data: { displayOrder: current.displayOrder },
    }),
  ]);

  return { id: current.id, moved: true as const };
}
