import { z } from "zod";

export const projectInputSchema = z.object({
  title: z.string().trim().min(2, "العنوان مطلوب").max(160),
  slug: z
    .string()
    .trim()
    .min(2, "الرابط مطلوب")
    .max(160)
    .regex(
      /^[a-z0-9-]+$/,
      "الرابط يجب أن يحتوي أحرف لاتينية صغيرة وأرقام وشرطات فقط"
    ),
  clientName: z.string().trim().max(160).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  summary: z.string().trim().min(2, "الملخص مطلوب").max(600),
  challenge: z.string().trim().max(4000).optional().or(z.literal("")),
  solution: z.string().trim().max(4000).optional().or(z.literal("")),
  duration: z.string().trim().max(80).optional().or(z.literal("")),
  resultText: z.string().trim().max(200).optional().or(z.literal("")),
  coverImageUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  coverImageAlt: z.string().trim().max(240).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  serviceIds: z.array(z.string()).default([]),
});

export type ProjectFormInput = z.infer<typeof projectInputSchema>;

export const projectMediaInputSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().trim().url("رابط الملف غير صالح"),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal("")),
  altText: z.string().trim().max(240).optional().or(z.literal("")),
  caption: z.string().trim().max(400).optional().or(z.literal("")),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  cloudinaryPublicId: z.string().trim().max(400).optional().or(z.literal("")),
  resourceType: z.string().trim().max(40).optional().or(z.literal("")),
  format: z.string().trim().max(20).optional().or(z.literal("")),
  bytes: z.number().int().positive().optional().nullable(),
  duration: z.number().positive().optional().nullable(),
});

export type ProjectMediaFormInput = z.infer<typeof projectMediaInputSchema>;

export const projectMediaMetaSchema = z.object({
  altText: z.string().trim().max(240).optional().or(z.literal("")),
  caption: z.string().trim().max(400).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type ProjectMediaMetaInput = z.infer<typeof projectMediaMetaSchema>;
