import type { OfferStatus } from "@/generated/prisma";

export type ComputedOfferStatus =
  | "upcoming"
  | "active"
  | "expired"
  | "full"
  | "disabled"
  | "invalid";

export type OfferLike = {
  startsAt: Date;
  endsAt: Date;
  maxSlots: number | null;
  bookedSlots: number;
  status: OfferStatus;
  isActive: boolean;
};

/**
 * Deterministic offer state from dates + slot capacity.
 * Stored status alone is not trusted when dates disagree.
 */
export function computeOfferStatus(
  offer: OfferLike,
  now: Date = new Date()
): Exclude<ComputedOfferStatus, "invalid"> {
  if (
    !offer.isActive ||
    offer.status === "DISABLED" ||
    offer.status === "DRAFT"
  ) {
    return "disabled";
  }

  if (now < offer.startsAt) {
    return "upcoming";
  }

  if (now > offer.endsAt || offer.status === "EXPIRED") {
    return "expired";
  }

  if (
    offer.maxSlots !== null &&
    offer.maxSlots >= 0 &&
    offer.bookedSlots >= offer.maxSlots
  ) {
    return "full";
  }

  return "active";
}

export function resolvePublicOfferStatus(
  offer: OfferLike,
  eligiblePackageCount: number,
  now: Date = new Date()
): ComputedOfferStatus {
  const base = computeOfferStatus(offer, now);
  if (
    (base === "active" || base === "upcoming" || base === "full") &&
    eligiblePackageCount < 1
  ) {
    return "invalid";
  }
  return base;
}

export function getRemainingSlots(
  maxSlots: number | null,
  bookedSlots: number
): number | null {
  if (maxSlots === null) return null;
  return Math.max(0, maxSlots - bookedSlots);
}

export function pickCurrentPublicOffer<T extends OfferLike>(
  offers: Array<T & { eligiblePackageCount: number }>,
  now: Date = new Date()
):
  | (T & {
      computedStatus: ComputedOfferStatus;
      eligiblePackageCount: number;
    })
  | null {
  const evaluated = offers.map(offer => ({
    ...offer,
    computedStatus: resolvePublicOfferStatus(
      offer,
      offer.eligiblePackageCount,
      now
    ),
  }));

  return (
    evaluated.find(offer => offer.computedStatus === "active") ??
    evaluated.find(offer => offer.computedStatus === "upcoming") ??
    evaluated.find(offer => offer.computedStatus === "full") ??
    null
  );
}

export function pickCurrentActiveOffer<T extends OfferLike>(
  offers: T[],
  now: Date = new Date()
): (T & { computedStatus: ComputedOfferStatus }) | null {
  const evaluated = offers.map(offer => ({
    ...offer,
    computedStatus: computeOfferStatus(offer, now) as ComputedOfferStatus,
  }));

  return (
    evaluated.find(offer => offer.computedStatus === "active") ??
    evaluated.find(offer => offer.computedStatus === "upcoming") ??
    null
  );
}
