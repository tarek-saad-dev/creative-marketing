import { z } from "zod";

export const projectImportMediaSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().min(1),
  thumbnailUrl: z.string().min(1).optional().nullable(),
  altText: z.string().min(1).optional().nullable(),
  caption: z.string().optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  displayOrder: z.number().int().nonnegative().default(0),
});

export const projectImportItemSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  title: z.string().trim().min(2).max(200),
  clientName: z.string().trim().max(160).optional().nullable(),
  industry: z.string().trim().max(120).optional().nullable(),
  summary: z.string().trim().min(10).max(2000),
  challenge: z.string().trim().max(5000).optional().nullable(),
  solution: z.string().trim().max(5000).optional().nullable(),
  duration: z.string().trim().max(120).optional().nullable(),
  resultText: z.string().trim().max(2000).optional().nullable(),
  coverImageUrl: z.string().trim().min(1).optional().nullable(),
  coverImageAlt: z.string().trim().min(1).optional().nullable(),
  featured: z.boolean().default(false),
  /** Never publish by default — must be explicit. */
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  displayOrder: z.number().int().nonnegative().default(0),
  publishedAt: z.coerce.date().optional().nullable(),
  serviceSlugs: z.array(z.string().trim().min(1)).default([]),
  media: z.array(projectImportMediaSchema).default([]),
});

export const projectImportManifestSchema = z.object({
  /** When false, existing rows are updated only for empty fields unless forceOverwrite. */
  forceOverwrite: z.boolean().default(false),
  projects: z.array(projectImportItemSchema).min(1),
});

export type ProjectImportManifest = z.infer<typeof projectImportManifestSchema>;
export type ProjectImportItem = z.infer<typeof projectImportItemSchema>;
