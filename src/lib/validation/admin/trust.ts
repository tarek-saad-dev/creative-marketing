import { z } from "zod";

export const trustMetricInputSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "المفتاح مطلوب")
    .max(80)
    .regex(/^[a-z0-9_.-]+$/, "أحرف لاتينية صغيرة وأرقام ونقاط/شرطات فقط"),
  label: z.string().trim().min(2, "التسمية مطلوبة").max(160),
  value: z.string().trim().min(1, "القيمة مطلوبة").max(40),
  prefix: z.string().trim().max(20).optional().or(z.literal("")),
  suffix: z.string().trim().max(20).optional().or(z.literal("")),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type TrustMetricFormInput = z.infer<typeof trustMetricInputSchema>;

export const clientLogoInputSchema = z.object({
  name: z.string().trim().min(2, "اسم العميل مطلوب").max(160),
  logoUrl: z.string().trim().url("رابط الشعار غير صالح"),
  websiteUrl: z
    .string()
    .trim()
    .url("رابط الموقع غير صالح")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type ClientLogoFormInput = z.infer<typeof clientLogoInputSchema>;
