import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma";

export type SiteSettingsMap = Record<string, unknown>;

function jsonToUnknown(value: Prisma.JsonValue): unknown {
  return value as unknown;
}

export async function getAllSiteSettings(): Promise<SiteSettingsMap> {
  const rows = await prisma.siteSetting.findMany({
    select: { key: true, value: true },
    orderBy: { key: "asc" },
  });

  return Object.fromEntries(
    rows.map(row => [row.key, jsonToUnknown(row.value)])
  );
}

export async function getSiteSettingByKey(
  key: string
): Promise<unknown | null> {
  const row = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  });
  return row ? jsonToUnknown(row.value) : null;
}

export async function upsertSiteSetting(
  key: string,
  value: Prisma.InputJsonValue,
  description?: string
) {
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value, description },
    update: { value, ...(description !== undefined ? { description } : {}) },
  });
}
