import { z } from "zod";

export const leadInputSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(120, "الاسم طويل جدًا"),
  phone: z
    .string()
    .trim()
    .min(8, "رقم الجوال مطلوب")
    .max(32, "رقم الجوال طويل جدًا")
    .regex(/^[0-9+\s()-]+$/, "رقم الجوال غير صالح"),
  projectName: z.string().trim().max(160).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  projectStage: z.string().trim().max(120).optional().or(z.literal("")),
  requestedService: z.string().trim().max(160).optional().or(z.literal("")),
  packageId: z.string().cuid().optional().nullable(),
  isCustomPackage: z.boolean().optional().default(false),
  budgetRange: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  preferredContactMethod: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  referrer: z.string().trim().max(500).optional().or(z.literal("")),
  landingUrl: z.string().trim().max(500).optional().or(z.literal("")),
  utmSource: z.string().trim().max(120).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(120).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(120).optional().or(z.literal("")),
  utmContent: z.string().trim().max(120).optional().or(z.literal("")),
  utmTerm: z.string().trim().max(120).optional().or(z.literal("")),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().or(z.literal("")),
  /** Minimum completion time guard (ms since form open). */
  formOpenedAt: z.number().int().positive().optional(),
  submissionToken: z.string().trim().max(80).optional(),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export const whatsappMessageInputSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  projectName: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  projectStage: z.string().trim().optional(),
  requestedService: z.string().trim().optional(),
  packageName: z.string().trim().optional(),
  budgetRange: z.string().trim().optional(),
  message: z.string().trim().optional(),
  preferredContactMethod: z.string().trim().optional(),
});

export type WhatsAppMessageInput = z.infer<typeof whatsappMessageInputSchema>;

export const packagePublicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string().nullable(),
  description: z.string(),
  idealFor: z.string(),
  originalPrice: z.string(),
  currency: z.string(),
  billingPeriod: z.string().nullable(),
  startTimeText: z.string().nullable(),
  revisionCount: z.number().nullable(),
  isFeatured: z.boolean(),
  displayOrder: z.number(),
  offerPrice: z.string().nullable(),
  savingAmount: z.string().nullable(),
  savingPercent: z.number().nullable(),
  features: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      category: z.string().nullable(),
      included: z.boolean(),
      displayOrder: z.number(),
    })
  ),
});

export const publicOfferSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    headline: z.string(),
    description: z.string().nullable(),
    startsAt: z.string(),
    endsAt: z.string(),
    maxSlots: z.number().nullable(),
    bookedSlots: z.number(),
    remainingSlots: z.number().nullable(),
    computedStatus: z.enum([
      "upcoming",
      "active",
      "expired",
      "full",
      "disabled",
      "invalid",
    ]),
    packages: z.array(
      z.object({
        packageId: z.string(),
        packageSlug: z.string(),
        packageName: z.string(),
        originalPrice: z.string(),
        offerPrice: z.string(),
        savingAmount: z.string().nullable(),
        savingPercent: z.number().nullable(),
        displayOrder: z.number(),
      })
    ),
  })
  .nullable();

export const contactReadinessSchema = z.object({
  hasWhatsApp: z.boolean(),
  hasEmail: z.boolean(),
  whatsappDigits: z.string().nullable(),
});

export const landingPageDataSchema = z.object({
  settings: z.record(z.string(), z.unknown()),
  brand: z.object({
    name: z.string(),
    slogan: z.string(),
  }),
  trustMetrics: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      label: z.string(),
      value: z.string(),
      prefix: z.string().nullable(),
      suffix: z.string().nullable(),
      displayOrder: z.number(),
    })
  ),
  clientLogos: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      logoUrl: z.string(),
      websiteUrl: z.string().nullable(),
      displayOrder: z.number(),
    })
  ),
  featuredProjects: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      clientName: z.string().nullable(),
      industry: z.string().nullable(),
      summary: z.string(),
      coverImageUrl: z.string(),
      coverImageAlt: z.string(),
      resultText: z.string().nullable(),
      duration: z.string().nullable(),
      displayOrder: z.number(),
      primaryMediaType: z.enum(["IMAGE", "VIDEO"]).nullable(),
      services: z.array(
        z.object({
          id: z.string(),
          slug: z.string(),
          nameAr: z.string(),
          nameEn: z.string(),
          category: z.enum(["THINK", "CREATE", "BUILD", "GROW"]),
        })
      ),
    })
  ),
  serviceEcosystem: z.array(
    z.object({
      category: z.enum(["THINK", "CREATE", "BUILD", "GROW"]),
      labelEn: z.string(),
      titleAr: z.string(),
      descriptionAr: z.string(),
      services: z.array(
        z.object({
          id: z.string(),
          slug: z.string(),
          nameAr: z.string(),
          nameEn: z.string(),
          summaryAr: z.string(),
        })
      ),
      projectPreview: z
        .object({
          id: z.string(),
          slug: z.string(),
          title: z.string(),
          coverImageUrl: z.string(),
          coverImageAlt: z.string(),
        })
        .nullable(),
    })
  ),
  services: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      nameAr: z.string(),
      nameEn: z.string(),
      category: z.enum(["THINK", "CREATE", "BUILD", "GROW"]),
      summaryAr: z.string(),
      summaryEn: z.string(),
      icon: z.string().nullable(),
      displayOrder: z.number(),
    })
  ),
  serviceGroups: z.array(
    z.object({
      category: z.enum(["THINK", "CREATE", "BUILD", "GROW"]),
      services: z.array(
        z.object({
          id: z.string(),
          slug: z.string(),
          nameAr: z.string(),
          nameEn: z.string(),
        })
      ),
    })
  ),
  activeOffer: z
    .object({
      id: z.string(),
      slug: z.string(),
      name: z.string(),
      headline: z.string(),
      description: z.string().nullable(),
      startsAt: z.date(),
      endsAt: z.date(),
      maxSlots: z.number().nullable(),
      bookedSlots: z.number(),
      remainingSlots: z.number().nullable(),
      computedStatus: z.enum([
        "upcoming",
        "active",
        "expired",
        "full",
        "disabled",
        "invalid",
      ]),
      packages: z.array(
        z.object({
          packageId: z.string(),
          packageSlug: z.string(),
          packageName: z.string(),
          offerPrice: z.string(),
          displayOrder: z.number(),
        })
      ),
    })
    .nullable(),
  offer: publicOfferSchema,
  packages: z.array(packagePublicSchema),
  testimonials: z.array(
    z.object({
      id: z.string(),
      clientName: z.string(),
      projectName: z.string().nullable(),
      industry: z.string().nullable(),
      quote: z.string(),
      clientImageUrl: z.string().nullable(),
      clientLogoUrl: z.string().nullable(),
      screenshotUrl: z.string().nullable(),
      serviceLabel: z.string().nullable(),
      displayOrder: z.number(),
    })
  ),
  faqs: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      question: z.string(),
      answer: z.string(),
      category: z.string().nullable(),
      displayOrder: z.number(),
    })
  ),
  faqCount: z.number().int().nonnegative(),
  contactReadiness: contactReadinessSchema,
});

export type LandingPageData = z.infer<typeof landingPageDataSchema>;
