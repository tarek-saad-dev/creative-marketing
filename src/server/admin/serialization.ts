import "server-only";

/** Safe JSON for admin UI — strips undefined and avoids Date surprises. */
export function serializeForAdmin<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function safeMetadataSummary(
  metadata: unknown,
  maxLength = 160
): string {
  if (metadata == null) return "—";
  try {
    const text = JSON.stringify(metadata);
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  } catch {
    return "—";
  }
}
