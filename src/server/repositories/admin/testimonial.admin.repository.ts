import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ContentStatus } from "@/generated/prisma";

export async function listTestimonialsForAdmin() {
  return prisma.testimonial.findMany({
    where: { deletedAt: null },
    orderBy: [{ status: "asc" }, { displayOrder: "asc" }],
  });
}

export async function findTestimonialByIdForAdmin(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export type TestimonialWriteInput = {
  clientName: string;
  projectName: string | null;
  industry: string | null;
  quote: string;
  clientImageUrl: string | null;
  clientLogoUrl: string | null;
  screenshotUrl: string | null;
  serviceLabel: string | null;
  publicApprovalConfirmed: boolean;
  displayOrder: number;
};

export async function createTestimonialRow(input: TestimonialWriteInput) {
  return prisma.testimonial.create({
    data: { ...input, status: ContentStatus.DRAFT },
    select: { id: true },
  });
}

export async function updateTestimonialRow(
  id: string,
  input: TestimonialWriteInput
) {
  return prisma.testimonial.update({
    where: { id },
    data: input,
    select: { id: true },
  });
}

export async function setTestimonialStatus(id: string, status: ContentStatus) {
  return prisma.testimonial.update({
    where: { id },
    data: {
      status,
      publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined,
    },
    select: { id: true, status: true },
  });
}

export async function softDeleteTestimonialRow(id: string) {
  return prisma.testimonial.update({
    where: { id },
    data: { deletedAt: new Date(), status: ContentStatus.ARCHIVED },
    select: { id: true },
  });
}
