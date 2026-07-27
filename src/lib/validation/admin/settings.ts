import { z } from "zod";

export const siteSettingInputSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "المفتاح مطلوب")
    .max(120)
    .regex(/^[a-z0-9_.-]+$/, "أحرف لاتينية صغيرة وأرقام ونقاط/شرطات فقط"),
  /** Raw text — stored as JSON if it parses, otherwise as a plain string. */
  value: z.string().trim().min(1, "القيمة مطلوبة").max(4000),
  description: z.string().trim().max(300).optional().or(z.literal("")),
});

export type SiteSettingFormInput = z.infer<typeof siteSettingInputSchema>;
