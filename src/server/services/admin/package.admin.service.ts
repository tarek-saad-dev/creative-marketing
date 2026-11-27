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
import {packageMissingFields,mayEditPackage,mayChangePackageFeatureFlag} from "@/lib/admin/commercial-readiness";

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
    currency: input.currency.trim() || "EGP",
    billingPeriod: toEmptyNull(input.billingPeriod),
    startTimeText: toEmptyNull(input.startTimeText),
    revisionCount: input.revisionCount ?? null,
    isFeatured: input.isFeatured,
    displayOrder: input.displayOrder,
    features: input.features.map((feature,index) => ({
      title: feature.title.trim(),
      description: toEmptyNull(feature.description),
      category: toEmptyNull(feature.category),
      included: feature.included,
      displayOrder: index,
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

export async function createPackageAdmin(rawInput: unknown,commercial=false) {
  const input = packageInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug);
  if(!mayChangePackageFeatureFlag(false,input.isFeatured,commercial))throw new Error("تمييز الباقات يحتاج مسؤولًا");
  const pkg = await createPackageRow(toWriteInput(input));
  revalidateHomepage();
  return pkg;
}

export async function updatePackageAdmin(id: string, rawInput: unknown,commercial=false) {
  const input = packageInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug, id);
  const old=await findPackageByIdForAdmin(id);
  if(!old||old.deletedAt)throw new Error("الباقة غير موجودة");
  if(!mayEditPackage(old.status,commercial)||!mayChangePackageFeatureFlag(old.isFeatured,input.isFeatured,commercial))throw new Error("تعديل هذه الباقة يحتاج مسؤولًا");
  if(old.status===ContentStatus.PUBLISHED&&packageMissingFields(input).length)throw new Error("أكمل بيانات الباقة المنشورة أو أعدها لمسودة أولًا");
  const pkg = await updatePackageRow(id, toWriteInput(input),commercial);
  revalidateHomepage();
  return pkg;
}

/** Mirrors `publicPackageWhere()` so publish can never produce a broken/free public card. */
export async function publishPackageAdmin(id: string) {
  const pkg = await findPackageByIdForAdmin(id);
  if (!pkg||pkg.deletedAt) throw new Error("الباقة غير موجودة");

  const missing=packageMissingFields(pkg);
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
