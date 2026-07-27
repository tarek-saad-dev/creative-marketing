import "server-only";

/**
 * Shared publication completeness checks used by admin editors.
 * Domain services still own final publish decisions.
 */

export type PublicationCheck = {
  key: string;
  label: string;
  ok: boolean;
};

export function projectPublicationChecks(input: {
  title?: string | null;
  slug?: string | null;
  industry?: string | null;
  summary?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
}): PublicationCheck[] {
  return [
    { key: "title", label: "العنوان", ok: Boolean(input.title?.trim()) },
    { key: "slug", label: "الرابط", ok: Boolean(input.slug?.trim()) },
    { key: "industry", label: "المجال", ok: Boolean(input.industry?.trim()) },
    { key: "summary", label: "الملخص", ok: Boolean(input.summary?.trim()) },
    {
      key: "coverImageUrl",
      label: "صورة الغلاف",
      ok: Boolean(input.coverImageUrl?.trim()),
    },
    {
      key: "coverImageAlt",
      label: "النص البديل للغلاف",
      ok: Boolean(input.coverImageAlt?.trim()),
    },
  ];
}

export function isPublicationReady(checks: PublicationCheck[]): boolean {
  return checks.every(check => check.ok);
}
