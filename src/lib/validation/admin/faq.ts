import { z } from "zod";

export const faqInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "الرابط مطلوب")
    .max(160)
    .regex(/^[a-z0-9-]+$/, "أحرف لاتينية صغيرة وأرقام وشرطات فقط"),
  question: z.string().trim().min(2, "السؤال مطلوب").max(300),
  answer: z.string().trim().min(2, "الإجابة مطلوبة").max(2000),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type FaqFormInput = z.infer<typeof faqInputSchema>;
