import { z } from "zod";

export const testimonialInputSchema = z.object({
  clientName: z.string().trim().min(2, "اسم العميل مطلوب").max(160),
  projectName: z.string().trim().max(160).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  quote: z.string().trim().min(2, "نص الرأي مطلوب").max(1000),
  clientImageUrl: z.string().trim().url().optional().or(z.literal("")),
  clientLogoUrl: z.string().trim().url().optional().or(z.literal("")),
  screenshotUrl: z.string().trim().url().optional().or(z.literal("")),
  serviceLabel: z.string().trim().max(160).optional().or(z.literal("")),
  publicApprovalConfirmed: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type TestimonialFormInput = z.infer<typeof testimonialInputSchema>;
