/**
 * Safe public media helpers — no secrets, no invented assets.
 */

export function isUsableMediaUrl(
  url: string | null | undefined
): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isLocalPublicPath(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

/**
 * Hosts allowed by `next.config.ts` `images.remotePatterns`. Must be kept in
 * sync with that file — any host not listed here will make Next.js throw at
 * request time ("Invalid src prop ... hostname is not configured"), so we
 * fall back to a plain `<img>` tag for those instead (see canUseNextImage).
 */
const NEXT_IMAGE_ALLOWED_HOSTS = ["res.cloudinary.com"];

export function canUseNextImage(url: string): boolean {
  if (isLocalPublicPath(url)) return true;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    return NEXT_IMAGE_ALLOWED_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

/** Prefer poster/thumbnail for video; otherwise cover. */
export function resolvePreviewSrc(options: {
  coverImageUrl: string;
  primaryMediaType: "IMAGE" | "VIDEO" | null;
  primaryMediaUrl?: string | null;
  primaryThumbnailUrl?: string | null;
}): { kind: "image" | "video"; src: string; poster: string } {
  const {
    coverImageUrl,
    primaryMediaType,
    primaryMediaUrl,
    primaryThumbnailUrl,
  } = options;

  if (
    primaryMediaType === "VIDEO" &&
    primaryMediaUrl &&
    isUsableMediaUrl(primaryMediaUrl)
  ) {
    return {
      kind: "video",
      src: primaryMediaUrl,
      poster:
        (primaryThumbnailUrl && isUsableMediaUrl(primaryThumbnailUrl)
          ? primaryThumbnailUrl
          : coverImageUrl) ?? coverImageUrl,
    };
  }

  return {
    kind: "image",
    src: coverImageUrl,
    poster: coverImageUrl,
  };
}
