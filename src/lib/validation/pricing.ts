/**
 * Package pricing helpers.
 * Zero / null prices must never appear as public configured prices.
 */

export function toPriceNumber(
  value: { toString(): string } | string | number | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(n) ? n : null;
}

export function hasValidConfiguredPrice(
  value: { toString(): string } | string | number | null | undefined
): boolean {
  const n = toPriceNumber(value);
  return n !== null && n > 0;
}

/**
 * Offer discount is public only when positive and below the package list price.
 */
export function isValidPublicOfferPrice(
  offerPrice: { toString(): string } | string | number | null | undefined,
  originalPrice: { toString(): string } | string | number | null | undefined
): boolean {
  const offer = toPriceNumber(offerPrice);
  const original = toPriceNumber(originalPrice);
  if (offer === null || original === null) return false;
  if (offer <= 0 || original <= 0) return false;
  return offer < original;
}

export function assertPackagePublishable(input: {
  originalPrice: { toString(): string } | string | number | null | undefined;
  status: string;
}): void {
  if (
    input.status === "PUBLISHED" &&
    !hasValidConfiguredPrice(input.originalPrice)
  ) {
    throw new Error("PACKAGE_PRICE_REQUIRED");
  }
}
