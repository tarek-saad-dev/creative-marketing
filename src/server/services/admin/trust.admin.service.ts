import "server-only";

import {
  clientLogoInputSchema,
  trustMetricInputSchema,
} from "@/lib/validation/admin/trust";
import {
  createClientLogoRow,
  createTrustMetricRow,
  deleteClientLogoRow,
  deleteTrustMetricRow,
  findTrustMetricByKeyForAdmin,
  listClientLogosForAdmin,
  listTrustMetricsForAdmin,
  updateClientLogoRow,
  updateTrustMetricRow,
} from "@/server/repositories/admin/trust.admin.repository";
import { revalidateHomepage } from "@/server/services/revalidation.service";

function toEmptyNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function listAdminTrustMetrics() {
  return listTrustMetricsForAdmin();
}

export async function createTrustMetricAdmin(rawInput: unknown) {
  const input = trustMetricInputSchema.parse(rawInput);
  const existing = await findTrustMetricByKeyForAdmin(input.key);
  if (existing) throw new Error("المفتاح مستخدم بالفعل");
  const row = await createTrustMetricRow({
    key: input.key,
    label: input.label.trim(),
    value: input.value.trim(),
    prefix: toEmptyNull(input.prefix),
    suffix: toEmptyNull(input.suffix),
    isVerified: input.isVerified,
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  });
  revalidateHomepage();
  return row;
}

export async function updateTrustMetricAdmin(id: string, rawInput: unknown) {
  const input = trustMetricInputSchema.parse(rawInput);
  const existing = await findTrustMetricByKeyForAdmin(input.key);
  if (existing && existing.id !== id) throw new Error("المفتاح مستخدم بالفعل");
  const row = await updateTrustMetricRow(id, {
    key: input.key,
    label: input.label.trim(),
    value: input.value.trim(),
    prefix: toEmptyNull(input.prefix),
    suffix: toEmptyNull(input.suffix),
    isVerified: input.isVerified,
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  });
  revalidateHomepage();
  return row;
}

export async function deleteTrustMetricAdmin(id: string) {
  const row = await deleteTrustMetricRow(id);
  revalidateHomepage();
  return row;
}

export async function listAdminClientLogos() {
  return listClientLogosForAdmin();
}

export async function createClientLogoAdmin(rawInput: unknown) {
  const input = clientLogoInputSchema.parse(rawInput);
  const row = await createClientLogoRow({
    name: input.name.trim(),
    logoUrl: input.logoUrl.trim(),
    websiteUrl: toEmptyNull(input.websiteUrl),
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  });
  revalidateHomepage();
  return row;
}

export async function updateClientLogoAdmin(id: string, rawInput: unknown) {
  const input = clientLogoInputSchema.parse(rawInput);
  const row = await updateClientLogoRow(id, {
    name: input.name.trim(),
    logoUrl: input.logoUrl.trim(),
    websiteUrl: toEmptyNull(input.websiteUrl),
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  });
  revalidateHomepage();
  return row;
}

export async function deleteClientLogoAdmin(id: string) {
  const row = await deleteClientLogoRow(id);
  revalidateHomepage();
  return row;
}
