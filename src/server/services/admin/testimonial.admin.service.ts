import "server-only";

import { ContentStatus } from "@/generated/prisma";
import { testimonialInputSchema } from "@/lib/validation/admin/testimonial";
import {
  createTestimonialRow,
  findTestimonialByIdForAdmin,
  listTestimonialsForAdmin,
  setTestimonialStatus,
  softDeleteTestimonialRow,
  updateTestimonialRow,
  type TestimonialWriteInput,
} from "@/server/repositories/admin/testimonial.admin.repository";
import { revalidateHomepage } from "@/server/services/revalidation.service";

function toEmptyNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function toWriteInput(
  input: ReturnType<typeof testimonialInputSchema.parse>
): TestimonialWriteInput {
  return {
    clientName: input.clientName.trim(),
    projectName: toEmptyNull(input.projectName),
    industry: toEmptyNull(input.industry),
    quote: input.quote.trim(),
    clientImageUrl: toEmptyNull(input.clientImageUrl),
    clientLogoUrl: toEmptyNull(input.clientLogoUrl),
    screenshotUrl: toEmptyNull(input.screenshotUrl),
    serviceLabel: toEmptyNull(input.serviceLabel),
    publicApprovalConfirmed: input.publicApprovalConfirmed,
    displayOrder: input.displayOrder,
  };
}

export async function listAdminTestimonials() {
  return listTestimonialsForAdmin();
}

export async function createTestimonialAdmin(rawInput: unknown) {
  const input = testimonialInputSchema.parse(rawInput);
  const row = await createTestimonialRow(toWriteInput(input));
  revalidateHomepage();
  return row;
}

export async function updateTestimonialAdmin(id: string, rawInput: unknown) {
  const input = testimonialInputSchema.parse(rawInput);
  const row = await updateTestimonialRow(id, toWriteInput(input));
  revalidateHomepage();
  return row;
}

export async function publishTestimonialAdmin(id: string) {
  const testimonial = await findTestimonialByIdForAdmin(id);
  if (!testimonial) throw new Error("رأي العميل غير موجود");
  if (!testimonial.publicApprovalConfirmed) {
    throw new Error("لا يمكن النشر قبل تأكيد موافقة العميل على النشر العام");
  }
  if (!testimonial.clientName.trim() || !testimonial.quote.trim()) {
    throw new Error("الاسم ونص الرأي مطلوبان قبل النشر");
  }
  const row = await setTestimonialStatus(id, ContentStatus.PUBLISHED);
  revalidateHomepage();
  return row;
}

export async function archiveTestimonialAdmin(id: string) {
  const row = await setTestimonialStatus(id, ContentStatus.ARCHIVED);
  revalidateHomepage();
  return row;
}

export async function unpublishTestimonialAdmin(id: string) {
  const row = await setTestimonialStatus(id, ContentStatus.DRAFT);
  revalidateHomepage();
  return row;
}

export async function softDeleteTestimonialAdmin(id: string) {
  const row = await softDeleteTestimonialRow(id);
  revalidateHomepage();
  return row;
}
