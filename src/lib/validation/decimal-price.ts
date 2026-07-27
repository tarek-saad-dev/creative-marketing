/**
 * Safe decimal string math for public pricing (no floating-point money ops).
 * Values are serialized as fixed 2-decimal strings.
 */

function toMinorUnits(value: string): bigint | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    const normalized = Number(trimmed);
    if (!Number.isFinite(normalized) || normalized <= 0) return null;
    return BigInt(Math.round(normalized * 100));
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = (fraction + "00").slice(0, 2);
  return BigInt(whole) * BigInt(100) + BigInt(cents);
}

function fromMinorUnits(value: bigint): string {
  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const whole = abs / BigInt(100);
  const cents = abs % BigInt(100);
  const body = `${whole.toString()}.${cents.toString().padStart(2, "0")}`;
  return negative ? `-${body}` : body;
}

export function decimalToPublicString(
  value: { toString(): string } | string | number | null | undefined
): string | null {
  if (value === null || value === undefined) return null;
  const raw = typeof value === "string" ? value : value.toString();
  const minor = toMinorUnits(raw);
  if (minor === null || minor <= BigInt(0)) return null;
  return fromMinorUnits(minor);
}

export function calculateSavingAmount(
  originalPrice: string,
  offerPrice: string
): string | null {
  const original = toMinorUnits(originalPrice);
  const offer = toMinorUnits(offerPrice);
  if (original === null || offer === null) return null;
  if (offer <= BigInt(0) || original <= BigInt(0) || offer >= original)
    return null;
  return fromMinorUnits(original - offer);
}

/** Whole-number percent rounded down; null when not useful. */
export function calculateSavingPercent(
  originalPrice: string,
  offerPrice: string
): number | null {
  const original = toMinorUnits(originalPrice);
  const offer = toMinorUnits(offerPrice);
  if (original === null || offer === null || original <= BigInt(0)) return null;
  if (offer <= BigInt(0) || offer >= original) return null;
  const pct = ((original - offer) * BigInt(100)) / original;
  const asNumber = Number(pct);
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : null;
}
