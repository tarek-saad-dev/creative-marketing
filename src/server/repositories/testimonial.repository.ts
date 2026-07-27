import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  publicTestimonialOrderBy,
  publicTestimonialWhere,
} from "@/server/repositories/commercial-publication";

export async function findPublishedTestimonials(now: Date = new Date()) {
  return prisma.testimonial.findMany({
    where: publicTestimonialWhere(now),
    orderBy: publicTestimonialOrderBy,
    select: {
      id: true,
      clientName: true,
      projectName: true,
      industry: true,
      quote: true,
      clientImageUrl: true,
      clientLogoUrl: true,
      screenshotUrl: true,
      serviceLabel: true,
      displayOrder: true,
    },
  });
}
