import "server-only";

import { ContentStatus } from "@/generated/prisma";
import { packageInputSchema } from "@/lib/validation/admin/package";
import {
  createPackageRow,
  findPackageByIdForAdmin,
  findPackageBySlugForAdmin,
  listPackagesForAdmin,
  setPackageStatus,
  softDeletePackageRow,
  updatePackageRow,
  type PackageWriteInput,
} from "@/server/repositories/admin/package.admin.repository";
import { revalidateHomepage } from "@/server/services/revalidation.service";
import { hasValidConfiguredPrice } from "@/lib/validation/pricing";

function toEmptyNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function toWriteInput(
  input: ReturnType<typeof packageInputSchema.parse>
): PackageWriteInput {
  return {
    slug: input.slug,
    name: input.name.trim(),
    tagline: toEmptyNull(input.tagline),
    description: input.description.trim(),
    idealFor: toEmptyNull(input.idealFor),
    originalPrice: toEmptyNull(input.originalPrice),
    currency: input.currency.trim() || "SAR",
    billingPeriod: toEmptyNull(input.billingPeriod),
    startTimeText: toEmptyNull(input.startTimeText),
    revisionCount: input.revisionCount ?? null,
    isFeatured: input.isFeatured,
    displayOrder: input.displayOrder,
    features: input.features.map(feature => ({
      title: feature.title.trim(),
      description: toEmptyNull(feature.description),
      category: toEmptyNull(feature.category),
      included: feature.included,
      displayOrder: feature.displayOrder,
    })),
  };
}

export async function listAdminPackages() {
  return listPackagesForAdmin();
}

export async function getAdminPackageById(id: string) {
  return findPackageByIdForAdmin(id);
}

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const existing = await findPackageBySlugForAdmin(slug);
  if (existing && existing.id !== excludeId) {
    throw new Error("الرابط مستخدم بالفعل لباقة أخرى");
  }
}

export async function createPackageAdmin(rawInput: unknown) {
  const input = packageInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug);
  const pkg = await createPackageRow(toWriteInput(input));
  revalidateHomepage();
  return pkg;
}

export async function updatePackageAdmin(id: string, rawInput: unknown) {
  const input = packageInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug, id);
  const pkg = await updatePackageRow(id, toWriteInput(input));
  revalidateHomepage();
  return pkg;
}

/** Mirrors `publicPackageWhere()` so publish can never produce a broken/free public card. */
export async function publishPackageAdmin(id: string) {
  const pkg = await findPackageByIdForAdmin(id);
  if (!pkg) throw new Error("الباقة غير موجودة");

  const missing: string[] = [];
  if (!hasValidConfiguredPrice(pkg.originalPrice))
    missing.push("سعر صالح أكبر من صفر");
  if (!pkg.idealFor?.trim()) missing.push('حقل "مناسبة لـ"');
  if (pkg.features.length === 0) missing.push("ميزة واحدة على الأقل");

  if (missing.length > 0) {
    throw new Error(`لا يمكن النشر — الحقول الناقصة: ${missing.join("، ")}`);
  }

  const updated = await setPackageStatus(id, ContentStatus.PUBLISHED);
  revalidateHomepage();
  return updated;
}

export async function archivePackageAdmin(id: string) {
  const updated = await setPackageStatus(id, ContentStatus.ARCHIVED);
  revalidateHomepage();
  return updated;
}

export async function unpublishPackageAdmin(id: string) {
  const updated = await setPackageStatus(id, ContentStatus.DRAFT);
  revalidateHomepage();
  return updated;
}

export async function softDeletePackageAdmin(id: string) {
  const updated = await softDeletePackageRow(id);
  revalidateHomepage();
  return updated;
}
