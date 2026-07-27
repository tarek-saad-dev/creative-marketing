import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function findVerifiedActiveTrustMetrics() {
  return prisma.trustMetric.findMany({
    where: {
      isActive: true,
      isVerified: true,
    },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      key: true,
      label: true,
      value: true,
      prefix: true,
      suffix: true,
      displayOrder: true,
    },
  });
}

export async function findActiveClientLogos() {
  return prisma.clientLogo.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      websiteUrl: true,
      displayOrder: true,
    },
  });
}
