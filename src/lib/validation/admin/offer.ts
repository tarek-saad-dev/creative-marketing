import { z } from "zod";

export const offerPackageInputSchema = z.object({
  packageId: z.string().min(1, "اختر باقة"),
  offerPrice: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "سعر العرض يجب أن يكون رقمًا صحيحًا"),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type OfferPackageFormInput = z.infer<typeof offerPackageInputSchema>;

export const offerInputSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(2, "الرابط مطلوب")
      .max(160)
      .regex(/^[a-z0-9-]+$/, "أحرف لاتينية صغيرة وأرقام وشرطات فقط"),
    name: z.string().trim().min(2, "اسم العرض مطلوب").max(160),
    headline: z.string().trim().min(2, "العنوان الرئيسي مطلوب").max(240),
    description: z.string().trim().max(1000).optional().or(z.literal("")),
    startsAt: z.string().min(1, "تاريخ البداية مطلوب"),
    endsAt: z.string().min(1, "تاريخ النهاية مطلوب"),
    maxSlots: z.coerce.number().int().min(1).optional().nullable(),
    isActive: z.boolean().default(false),
    packages: z.array(offerPackageInputSchema).default([]),
  })
  .refine(
    data => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(),
    {
      message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
      path: ["endsAt"],
    }
  );

export type OfferFormInput = z.infer<typeof offerInputSchema>;
