import "server-only";

import { prisma } from "@/lib/db/prisma";
import { OfferStatus } from "@/generated/prisma";

export async function listOffersForAdmin() {
  return prisma.limitedOffer.findMany({
    orderBy: [{ startsAt: "desc" }],
    include: {
      offerPackages: {
        orderBy: { displayOrder: "asc" },
        include: {
          package: { select: { id: true, name: true, originalPrice: true } },
        },
      },
    },
  });
}

export async function findOfferByIdForAdmin(id: string) {
  return prisma.limitedOffer.findUnique({
    where: { id },
    include: {
      offerPackages: {
        orderBy: { displayOrder: "asc" },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              originalPrice: true,
              status: true,
              deletedAt: true,
            },
          },
        },
      },
    },
  });
}

export async function findOfferBySlugForAdmin(slug: string) {
  return prisma.limitedOffer.findUnique({
    where: { slug },
    select: { id: true },
  });
}

export type OfferWriteInput = {
  slug: string;
  name: string;
  headline: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
  maxSlots: number | null;
  isActive: boolean;
  packages: Array<{
    packageId: string;
    offerPrice: string;
    displayOrder: number;
  }>;
};

export async function createOfferRow(input: OfferWriteInput) {
  return prisma.$transaction(async tx => {
    const offer = await tx.limitedOffer.create({
      data: {
        slug: input.slug,
        name: input.name,
        headline: input.headline,
        description: input.description,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        maxSlots: input.maxSlots,
        isActive: input.isActive,
        status: OfferStatus.DRAFT,
      },
      select: { id: true, slug: true },
    });

    if (input.packages.length > 0) {
      await tx.offerPackage.createMany({
        data: input.packages.map(pkg => ({
          offerId: offer.id,
          packageId: pkg.packageId,
          offerPrice: pkg.offerPrice,
          displayOrder: pkg.displayOrder,
        })),
      });
    }

    return offer;
  });
}

export async function updateOfferRow(id: string, input: OfferWriteInput) {
  return prisma.$transaction(async tx => {
    const offer = await tx.limitedOffer.update({
      where: { id },
      data: {
        slug: input.slug,
        name: input.name,
        headline: input.headline,
        description: input.description,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        maxSlots: input.maxSlots,
        isActive: input.isActive,
      },
      select: { id: true, slug: true },
    });

    await tx.offerPackage.deleteMany({ where: { offerId: id } });
    if (input.packages.length > 0) {
      await tx.offerPackage.createMany({
        data: input.packages.map(pkg => ({
          offerId: id,
          packageId: pkg.packageId,
          offerPrice: pkg.offerPrice,
          displayOrder: pkg.displayOrder,
        })),
      });
    }

    return offer;
  });
}

export async function setOfferStatus(id: string, status: OfferStatus) {
  return prisma.limitedOffer.update({
    where: { id },
    data: {
      status,
      isActive:
        status === OfferStatus.ACTIVE || status === OfferStatus.SCHEDULED,
    },
    select: { id: true, slug: true, status: true },
  });
}

export async function disableOfferRow(id: string) {
  return prisma.limitedOffer.update({
    where: { id },
    data: { status: OfferStatus.DISABLED, isActive: false },
    select: { id: true, slug: true, status: true },
  });
}
