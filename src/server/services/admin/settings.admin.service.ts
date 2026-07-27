import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma";
import {
  SEO_SETTING_KEYS,
  STRUCTURED_SETTING_KEYS,
  structuredSiteSettingsSchema,
  type StructuredSiteSettingsInput,
} from "@/lib/validation/admin/structured-settings";
import { upsertSiteSetting } from "@/server/repositories/site-settings.repository";
import { logAdminAction } from "@/server/services/admin-audit.service";
import {
  revalidateHomepage,
  revalidateSiteWide,
} from "@/server/services/revalidation.service";
import { siteSettingInputSchema } from "@/lib/validation/admin/settings";
import { revalidatePath } from "next/cache";

function asStoredString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function normalizeEmpty(value: string): string {
  return value.trim();
}

export async function listAdminSiteSettings() {
  return prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
}

export async function getStructuredSiteSettings(): Promise<StructuredSiteSettingsInput> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.values(STRUCTURED_SETTING_KEYS) } },
    select: { key: true, value: true },
  });
  const map = Object.fromEntries(
    rows.map(row => [row.key, asStoredString(row.value)])
  );

  return {
    brandName: map[STRUCTURED_SETTING_KEYS.brandName] ?? "",
    slogan: map[STRUCTURED_SETTING_KEYS.slogan] ?? "",
    descriptionAr: map[STRUCTURED_SETTING_KEYS.descriptionAr] ?? "",
    descriptionEn: map[STRUCTURED_SETTING_KEYS.descriptionEn] ?? "",
    whatsapp: map[STRUCTURED_SETTING_KEYS.whatsapp] ?? "",
    email: map[STRUCTURED_SETTING_KEYS.email] ?? "",
    responseHours: map[STRUCTURED_SETTING_KEYS.responseHours] ?? "",
    preferredContactMessage:
      map[STRUCTURED_SETTING_KEYS.preferredContactMessage] ?? "",
    instagram: map[STRUCTURED_SETTING_KEYS.instagram] ?? "",
    facebook: map[STRUCTURED_SETTING_KEYS.facebook] ?? "",
    behance: map[STRUCTURED_SETTING_KEYS.behance] ?? "",
    linkedin: map[STRUCTURED_SETTING_KEYS.linkedin] ?? "",
    heroEyebrow: map[STRUCTURED_SETTING_KEYS.heroEyebrow] ?? "",
    heroTitleAr: map[STRUCTURED_SETTING_KEYS.heroTitleAr] ?? "",
    heroDescription: map[STRUCTURED_SETTING_KEYS.heroDescription] ?? "",
    heroPrimaryCta: map[STRUCTURED_SETTING_KEYS.heroPrimaryCta] ?? "",
    heroSecondaryCta: map[STRUCTURED_SETTING_KEYS.heroSecondaryCta] ?? "",
    heroMicrocopy: map[STRUCTURED_SETTING_KEYS.heroMicrocopy] ?? "",
    heroPricingMicrocopy:
      map[STRUCTURED_SETTING_KEYS.heroPricingMicrocopy] ?? "",
    seoSiteTitle: map[STRUCTURED_SETTING_KEYS.seoSiteTitle] ?? "",
    seoMetaDescriptionAr:
      map[STRUCTURED_SETTING_KEYS.seoMetaDescriptionAr] ?? "",
    seoSiteUrl: map[STRUCTURED_SETTING_KEYS.seoSiteUrl] ?? "",
    seoOgImageUrl: map[STRUCTURED_SETTING_KEYS.seoOgImageUrl] ?? "",
  };
}

export async function saveStructuredSiteSettingsAdmin(input: {
  raw: unknown;
  adminUserId: string;
}) {
  const parsed = structuredSiteSettingsSchema.parse(input.raw);
  const existing = await getStructuredSiteSettings();
  const changedKeys: string[] = [];
  let seoChanged = false;

  for (const field of Object.keys(
    STRUCTURED_SETTING_KEYS
  ) as (keyof StructuredSiteSettingsInput)[]) {
    const next = normalizeEmpty(parsed[field]);
    const prev = normalizeEmpty(existing[field]);
    if (next === prev) continue;

    const key = STRUCTURED_SETTING_KEYS[field];
    changedKeys.push(key);
    if (SEO_SETTING_KEYS.has(key)) seoChanged = true;

    // Empty string → store empty string (public readers treat as absent)
    await upsertSiteSetting(key, next as Prisma.InputJsonValue);
  }

  if (changedKeys.length > 0) {
    await logAdminAction({
      adminUserId: input.adminUserId,
      action: "site_setting.structured_update",
      entityType: "SiteSetting",
      entityId: null,
      metadata: {
        changedKeys,
        count: changedKeys.length,
        seoChanged,
      },
    });

    revalidateHomepage();
    if (seoChanged) {
      revalidatePath("/sitemap.xml");
      revalidatePath("/robots.txt");
      revalidateSiteWide();
    }
  }

  return { changedKeys };
}

function parseSettingValue(raw: string): Prisma.InputJsonValue {
  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    return raw;
  }
}

export async function upsertSiteSettingAdmin(rawInput: unknown) {
  const input = siteSettingInputSchema.parse(rawInput);
  const value = parseSettingValue(input.value);
  const description = input.description?.trim() || undefined;

  const setting = await upsertSiteSetting(input.key, value, description);
  revalidateSiteWide();
  return { id: setting.id, key: setting.key };
}

export async function deleteSiteSettingAdmin(id: string) {
  const setting = await prisma.siteSetting.delete({
    where: { id },
    select: { id: true, key: true },
  });
  revalidateSiteWide();
  return setting;
}
