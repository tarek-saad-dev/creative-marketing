import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    value => value === "" || /^https?:\/\//i.test(value),
    "الرابط يجب أن يبدأ بـ http:// أو https://"
  );

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .refine(
    value => value === "" || z.string().email().safeParse(value).success,
    "بريد إلكتروني غير صالح"
  );

/** Digits / + only — do not invent a country code. */
const optionalWhatsApp = z
  .string()
  .trim()
  .max(32)
  .refine(
    value => value === "" || /^\+?[\d\s()-]{8,}$/.test(value),
    "رقم واتساب غير صالح"
  );

export const structuredSiteSettingsSchema = z.object({
  brandName: z.string().trim().max(120),
  slogan: z.string().trim().max(200),
  descriptionAr: z.string().trim().max(1000),
  descriptionEn: z.string().trim().max(1000),
  whatsapp: optionalWhatsApp,
  email: optionalEmail,
  responseHours: z.string().trim().max(200),
  preferredContactMessage: z.string().trim().max(500),
  instagram: optionalUrl,
  facebook: optionalUrl,
  behance: optionalUrl,
  linkedin: optionalUrl,
  heroEyebrow: z.string().trim().max(200),
  heroTitleAr: z.string().trim().max(300),
  heroDescription: z.string().trim().max(1000),
  heroPrimaryCta: z.string().trim().max(80),
  heroSecondaryCta: z.string().trim().max(80),
  heroMicrocopy: z.string().trim().max(200),
  heroPricingMicrocopy: z.string().trim().max(200),
  seoSiteTitle: z.string().trim().max(120),
  seoMetaDescriptionAr: z.string().trim().max(320),
  seoSiteUrl: optionalUrl,
  seoOgImageUrl: optionalUrl,
});

export type StructuredSiteSettingsInput = z.infer<
  typeof structuredSiteSettingsSchema
>;

/** Maps form fields → SiteSetting keys used by the public site. */
export const STRUCTURED_SETTING_KEYS = {
  brandName: "brand.name",
  slogan: "brand.slogan",
  descriptionAr: "brand.descriptionAr",
  descriptionEn: "brand.descriptionEn",
  whatsapp: "brand.whatsapp",
  email: "brand.email",
  responseHours: "brand.responseHours",
  preferredContactMessage: "brand.preferredContactMessage",
  instagram: "brand.instagram",
  facebook: "brand.facebook",
  behance: "brand.behance",
  linkedin: "brand.linkedin",
  heroEyebrow: "landing.hero.badge",
  heroTitleAr: "landing.hero.title",
  heroDescription: "landing.hero.description",
  heroPrimaryCta: "landing.hero.primaryCta",
  heroSecondaryCta: "landing.hero.secondaryCta",
  heroMicrocopy: "landing.hero.microcopy",
  heroPricingMicrocopy: "landing.hero.pricingMicrocopy",
  seoSiteTitle: "seo.siteTitle",
  seoMetaDescriptionAr: "seo.metaDescriptionAr",
  seoSiteUrl: "seo.siteUrl",
  seoOgImageUrl: "seo.ogImageUrl",
} as const satisfies Record<keyof StructuredSiteSettingsInput, string>;

export type StructuredSettingKey =
  (typeof STRUCTURED_SETTING_KEYS)[keyof typeof STRUCTURED_SETTING_KEYS];

export const SEO_SETTING_KEYS = new Set<string>([
  STRUCTURED_SETTING_KEYS.seoSiteTitle,
  STRUCTURED_SETTING_KEYS.seoMetaDescriptionAr,
  STRUCTURED_SETTING_KEYS.seoSiteUrl,
  STRUCTURED_SETTING_KEYS.seoOgImageUrl,
]);
