import { z } from "zod";

export const serviceCategorySchema = z.enum([
  "THINK",
  "CREATE",
  "BUILD",
  "GROW",
]);

export const serviceInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "الرابط مطلوب")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "أحرف لاتينية صغيرة وأرقام وشرطات فقط"),
  nameAr: z.string().trim().min(2, "الاسم بالعربية مطلوب").max(160),
  nameEn: z.string().trim().min(2, "الاسم بالإنجليزية مطلوب").max(160),
  category: serviceCategorySchema,
  summaryAr: z.string().trim().min(2, "الملخص بالعربية مطلوب").max(300),
  summaryEn: z.string().trim().min(2, "الملخص بالإنجليزية مطلوب").max(300),
  descriptionAr: z.string().trim().min(2, "الوصف بالعربية مطلوب").max(4000),
  descriptionEn: z.string().trim().min(2, "الوصف بالإنجليزية مطلوب").max(4000),
  icon: z.string().trim().max(80).optional().or(z.literal("")),
  imageUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type ServiceFormInput = z.infer<typeof serviceInputSchema>;
