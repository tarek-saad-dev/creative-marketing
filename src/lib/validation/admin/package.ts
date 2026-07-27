import { z } from "zod";

export const packageFeatureInputSchema = z.object({
  title: z.string().trim().min(1, "عنوان الميزة مطلوب").max(200),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  included: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type PackageFeatureFormInput = z.infer<typeof packageFeatureInputSchema>;

export const packageInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "الرابط مطلوب")
    .max(160)
    .regex(/^[a-z0-9-]+$/, "أحرف لاتينية صغيرة وأرقام وشرطات فقط"),
  name: z.string().trim().min(2, "اسم الباقة مطلوب").max(160),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(2, "الوصف مطلوب").max(2000),
  idealFor: z.string().trim().max(200).optional().or(z.literal("")),
  /** Empty string = not configured yet (kept null). */
  originalPrice: z
    .string()
    .trim()
    .regex(/^$|^\d+(\.\d{1,2})?$/, "السعر يجب أن يكون رقمًا صحيحًا")
    .optional()
    .or(z.literal("")),
  currency: z.string().trim().min(1).max(10).default("SAR"),
  billingPeriod: z.string().trim().max(80).optional().or(z.literal("")),
  startTimeText: z.string().trim().max(120).optional().or(z.literal("")),
  revisionCount: z.coerce.number().int().min(0).optional().nullable(),
  isFeatured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  features: z.array(packageFeatureInputSchema).default([]),
});

export type PackageFormInput = z.infer<typeof packageInputSchema>;
