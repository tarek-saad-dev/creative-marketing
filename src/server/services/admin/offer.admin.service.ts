import "server-only";

import { ContentStatus, OfferStatus } from "@/generated/prisma";
import { offerInputSchema } from "@/lib/validation/admin/offer";
import {
  createOfferRow,
  disableOfferRow,
  findOfferByIdForAdmin,
  findOfferBySlugForAdmin,
  listOffersForAdmin,
  setOfferStatus,
  updateOfferRow,
  type OfferWriteInput,
} from "@/server/repositories/admin/offer.admin.repository";
import { revalidateHomepage } from "@/server/services/revalidation.service";
import { isValidPublicOfferPrice } from "@/lib/validation/pricing";

function toEmptyNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function toWriteInput(
  input: ReturnType<typeof offerInputSchema.parse>
): OfferWriteInput {
  return {
    slug: input.slug,
    name: input.name.trim(),
    headline: input.headline.trim(),
    description: toEmptyNull(input.description),
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
    maxSlots: input.maxSlots ?? null,
    isActive: input.isActive,
    packages: input.packages.map(pkg => ({
      packageId: pkg.packageId,
      offerPrice: pkg.offerPrice,
      displayOrder: pkg.displayOrder,
    })),
  };
}

export async function listAdminOffers() {
  return listOffersForAdmin();
}

export async function getAdminOfferById(id: string) {
  return findOfferByIdForAdmin(id);
}

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const existing = await findOfferBySlugForAdmin(slug);
  if (existing && existing.id !== excludeId) {
    throw new Error("الرابط مستخدم بالفعل لعرض آخر");
  }
}

export async function createOfferAdmin(rawInput: unknown) {
  const input = offerInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug);
  const offer = await createOfferRow(toWriteInput(input));
  revalidateHomepage();
  return offer;
}

export async function updateOfferAdmin(id: string, rawInput: unknown) {
  const input = offerInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug, id);
  const offer = await updateOfferRow(id, toWriteInput(input));
  revalidateHomepage();
  return offer;
}

/** Activates/schedules based on current date vs range — mirrors `resolvePublicOfferStatus()`. */
export async function activateOfferAdmin(id: string) {
  const offer = await findOfferByIdForAdmin(id);
  if (!offer) throw new Error("العرض غير موجود");

  const eligiblePackages = offer.offerPackages.filter(
    row =>
      !row.package.deletedAt &&
      row.package.status === ContentStatus.PUBLISHED &&
      isValidPublicOfferPrice(row.offerPrice, row.package.originalPrice)
  );

  if (eligiblePackages.length === 0) {
    throw new Error(
      "لا يمكن التفعيل — لا توجد باقة واحدة على الأقل بسعر عرض صالح وباقة منشورة"
    );
  }

  const now = new Date();
  const status =
    offer.startsAt > now
      ? OfferStatus.SCHEDULED
      : offer.endsAt < now
        ? OfferStatus.EXPIRED
        : OfferStatus.ACTIVE;

  if (status === OfferStatus.EXPIRED) {
    throw new Error("لا يمكن التفعيل — تاريخ انتهاء العرض في الماضي");
  }

  const updated = await setOfferStatus(id, status);
  revalidateHomepage();
  return updated;
}

export async function disableOfferAdmin(id: string) {
  const updated = await disableOfferRow(id);
  revalidateHomepage();
  return updated;
}
