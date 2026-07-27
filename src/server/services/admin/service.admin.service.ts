import "server-only";

import { serviceInputSchema } from "@/lib/validation/admin/service";
import {
  createServiceAdminRow,
  findServiceByIdForAdmin,
  findServiceBySlugForAdmin,
  listServicesForAdmin,
  setServiceActive,
  softDeleteServiceRow,
  swapServiceDisplayOrder,
  updateServiceAdminRow,
  type ServiceWriteInput,
} from "@/server/repositories/admin/service.admin.repository";
import { revalidateHomepage } from "@/server/services/revalidation.service";

function toEmptyNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function toWriteInput(
  input: ReturnType<typeof serviceInputSchema.parse>
): ServiceWriteInput {
  return {
    slug: input.slug,
    nameAr: input.nameAr.trim(),
    nameEn: input.nameEn.trim(),
    category: input.category,
    summaryAr: input.summaryAr.trim(),
    summaryEn: input.summaryEn.trim(),
    descriptionAr: input.descriptionAr.trim(),
    descriptionEn: input.descriptionEn.trim(),
    icon: toEmptyNull(input.icon),
    imageUrl: toEmptyNull(input.imageUrl),
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  };
}

export async function listAdminServices() {
  return listServicesForAdmin();
}

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const existing = await findServiceBySlugForAdmin(slug);
  if (existing && existing.id !== excludeId) {
    throw new Error("الرابط مستخدم بالفعل لخدمة أخرى");
  }
}

export async function createServiceAdmin(rawInput: unknown) {
  const input = serviceInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug);
  const service = await createServiceAdminRow(toWriteInput(input));
  revalidateHomepage();
  return service;
}

export async function updateServiceAdmin(id: string, rawInput: unknown) {
  const input = serviceInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug, id);
  const service = await updateServiceAdminRow(id, toWriteInput(input));
  revalidateHomepage();
  return service;
}

export async function toggleServiceActiveAdmin(id: string, isActive: boolean) {
  const service = await setServiceActive(id, isActive);
  revalidateHomepage();
  return service;
}

export async function archiveServiceAdmin(id: string) {
  const existing = await findServiceByIdForAdmin(id);
  if (existing && existing._count.projectServices > 0) {
    throw new Error(
      "لا يمكن أرشفة خدمة مرتبطة بأعمال منشورة — عطّلها بدلاً من الأرشفة أو أزل الربط أولاً"
    );
  }
  const service = await softDeleteServiceRow(id);
  revalidateHomepage();
  return service;
}

export async function moveServiceAdmin(id: string, direction: "up" | "down") {
  const result = await swapServiceDisplayOrder(id, direction);
  if (result.moved) revalidateHomepage();
  return result;
}
