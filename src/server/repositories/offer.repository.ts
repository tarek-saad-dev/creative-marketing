import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function findCandidateActiveOffers(now: Date = new Date()) {
  return prisma.limitedOffer.findMany({
    where: {
      isActive: true,
      OR: [
        { status: "ACTIVE" },
        { status: "SCHEDULED" },
        {
          AND: [{ startsAt: { lte: now } }, { endsAt: { gte: now } }],
        },
      ],
    },
    orderBy: [{ startsAt: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      headline: true,
      description: true,
      startsAt: true,
      endsAt: true,
      maxSlots: true,
      bookedSlots: true,
      status: true,
      isActive: true,
      offerPackages: {
        orderBy: { displayOrder: "asc" },
        select: {
          offerPrice: true,
          displayOrder: true,
          package: {
            select: {
              id: true,
              slug: true,
              name: true,
              status: true,
              deletedAt: true,
              originalPrice: true,
            },
          },
        },
      },
    },
  });
}
