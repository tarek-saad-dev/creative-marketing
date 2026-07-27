import "server-only";

import type { Prisma } from "@/generated/prisma";
import { ContentStatus } from "@/generated/prisma";

export function publicPackageWhere(): Prisma.PackageWhereInput {
  return {
    deletedAt: null,
    status: ContentStatus.PUBLISHED,
    originalPrice: { not: null, gt: 0 },
    name: { not: "" },
    description: { not: "" },
    idealFor: { not: null },
    AND: [{ idealFor: { not: "" } }, { currency: { not: "" } }],
    features: { some: {} },
  };
}

export const publicPackageOrderBy: Prisma.PackageOrderByWithRelationInput[] = [
  { displayOrder: "asc" },
  { isFeatured: "desc" },
  { id: "asc" },
];

export function publicTestimonialWhere(
  now: Date = new Date()
): Prisma.TestimonialWhereInput {
  return {
    deletedAt: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: { not: null, lte: now },
    AND: [{ clientName: { not: "" } }, { quote: { not: "" } }],
  };
}

export const publicTestimonialOrderBy: Prisma.TestimonialOrderByWithRelationInput[] =
  [{ displayOrder: "asc" }, { publishedAt: "desc" }, { id: "asc" }];
