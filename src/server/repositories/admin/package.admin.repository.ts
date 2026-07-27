import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ContentStatus } from "@/generated/prisma";

export async function listPackagesForAdmin() {
  return prisma.package.findMany({
    where: { deletedAt: null },
    orderBy: [{ displayOrder: "asc" }],
    include: { features: { orderBy: { displayOrder: "asc" } } },
  });
}

export async function findPackageByIdForAdmin(id: string) {
  return prisma.package.findUnique({
    where: { id },
    include: { features: { orderBy: { displayOrder: "asc" } } },
  });
}

export async function findPackageBySlugForAdmin(slug: string) {
  return prisma.package.findUnique({ where: { slug }, select: { id: true } });
}

export type PackageWriteInput = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  idealFor: string | null;
  originalPrice: string | null;
  currency: string;
  billingPeriod: string | null;
  startTimeText: string | null;
  revisionCount: number | null;
  isFeatured: boolean;
  displayOrder: number;
  features: Array<{
    title: string;
    description: string | null;
    category: string | null;
    included: boolean;
    displayOrder: number;
  }>;
};

export async function createPackageRow(input: PackageWriteInput) {
  return prisma.$transaction(async tx => {
    if (input.isFeatured) {
      await tx.package.updateMany({
        where: { isFeatured: true, deletedAt: null },
        data: { isFeatured: false },
      });
    }

    const pkg = await tx.package.create({
      data: {
        slug: input.slug,
        name: input.name,
        tagline: input.tagline,
        description: input.description,
        idealFor: input.idealFor,
        originalPrice: input.originalPrice,
        currency: input.currency,
        billingPeriod: input.billingPeriod,
        startTimeText: input.startTimeText,
        revisionCount: input.revisionCount,
        isFeatured: input.isFeatured,
        displayOrder: input.displayOrder,
        status: ContentStatus.DRAFT,
      },
      select: { id: true, slug: true },
    });

    if (input.features.length > 0) {
      await tx.packageFeature.createMany({
        data: input.features.map(feature => ({
          ...feature,
          packageId: pkg.id,
        })),
      });
    }

    return pkg;
  });
}

export async function updatePackageRow(id: string, input: PackageWriteInput) {
  return prisma.$transaction(async tx => {
    if (input.isFeatured) {
      await tx.package.updateMany({
        where: { isFeatured: true, deletedAt: null, id: { not: id } },
        data: { isFeatured: false },
      });
    }

    const pkg = await tx.package.update({
      where: { id },
      data: {
        slug: input.slug,
        name: input.name,
        tagline: input.tagline,
        description: input.description,
        idealFor: input.idealFor,
        originalPrice: input.originalPrice,
        currency: input.currency,
        billingPeriod: input.billingPeriod,
        startTimeText: input.startTimeText,
        revisionCount: input.revisionCount,
        isFeatured: input.isFeatured,
        displayOrder: input.displayOrder,
      },
      select: { id: true, slug: true },
    });

    await tx.packageFeature.deleteMany({ where: { packageId: id } });
    if (input.features.length > 0) {
      await tx.packageFeature.createMany({
        data: input.features.map(feature => ({ ...feature, packageId: id })),
      });
    }

    return pkg;
  });
}

export async function setPackageStatus(id: string, status: ContentStatus) {
  return prisma.package.update({
    where: { id },
    data: { status },
    select: { id: true, slug: true, status: true },
  });
}

export async function softDeletePackageRow(id: string) {
  return prisma.package.update({
    where: { id },
    data: { deletedAt: new Date(), status: ContentStatus.ARCHIVED },
    select: { id: true, slug: true },
  });
}
