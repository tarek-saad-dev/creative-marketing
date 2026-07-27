import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ContentStatus } from "@/generated/prisma";
import {
  publicPackageOrderBy,
  publicPackageWhere,
} from "@/server/repositories/commercial-publication";

/**
 * Public packages must be published, complete, priced > 0, and have features.
 */
export async function findPublishedPackages() {
  return prisma.package.findMany({
    where: publicPackageWhere(),
    orderBy: publicPackageOrderBy,
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      description: true,
      idealFor: true,
      originalPrice: true,
      currency: true,
      billingPeriod: true,
      startTimeText: true,
      revisionCount: true,
      isFeatured: true,
      displayOrder: true,
      features: {
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          included: true,
          displayOrder: true,
        },
      },
    },
  });
}

export async function findPackageById(id: string) {
  return prisma.package.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      originalPrice: true,
    },
  });
}

/** Public-eligible package for lead submission (price + status). */
export async function findPublicPackageById(id: string) {
  return prisma.package.findFirst({
    where: {
      ...publicPackageWhere(),
      id,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      originalPrice: true,
      currency: true,
    },
  });
}

export async function findAnyPackageForDevTest() {
  return prisma.package.findFirst({
    where: { deletedAt: null },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      originalPrice: true,
    },
  });
}

export async function countPackagesByStatus() {
  const groups = await prisma.package.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: { _all: true },
  });
  return groups;
}

export type PackagePublishInput = {
  originalPrice: { toString(): string } | number | string | null;
  status: ContentStatus;
};
