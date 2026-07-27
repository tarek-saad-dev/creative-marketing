import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryEnv, isCloudinaryConfigured } from "@/lib/env/server";

/**
 * Whitelisted upload destinations. Admin upload UI must always pass one of
 * these keys — never a raw folder string — so uploads can never escape the
 * `creative-marketing/` namespace.
 */
export const CLOUDINARY_FOLDER_PREFIX = "creative-marketing" as const;

export const CLOUDINARY_FOLDERS = {
  projects: `${CLOUDINARY_FOLDER_PREFIX}/projects`,
  testimonials: `${CLOUDINARY_FOLDER_PREFIX}/testimonials`,
  clientLogos: `${CLOUDINARY_FOLDER_PREFIX}/client-logos`,
  brand: `${CLOUDINARY_FOLDER_PREFIX}/brand`,
  hero: `${CLOUDINARY_FOLDER_PREFIX}/hero`,
  og: `${CLOUDINARY_FOLDER_PREFIX}/og`,
  services: `${CLOUDINARY_FOLDER_PREFIX}/services`,
} as const;

export type CloudinaryFolderKey = keyof typeof CLOUDINARY_FOLDERS;

/** Sanitize project slug before appending to the projects folder family. */
export function sanitizeCloudinarySlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function resolveCloudinaryFolder(
  folderKey: CloudinaryFolderKey,
  projectSlug?: string
): string {
  const base = CLOUDINARY_FOLDERS[folderKey];
  if (folderKey !== "projects") return base;
  const sanitized = projectSlug ? sanitizeCloudinarySlug(projectSlug) : "";
  if (!sanitized) {
    throw new Error("معرّف المشروع مطلوب لرفع وسائط المشروع");
  }
  return `${base}/${sanitized}`;
}

export { isCloudinaryConfigured };

function configure() {
  const env = getCloudinaryEnv();
  cloudinary.config({
    cloud_name: env.cloudName,
    api_key: env.apiKey,
    api_secret: env.apiSecret,
    secure: true,
  });
  return env;
}

export type SignedUploadParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

/**
 * Signs upload params server-side so the browser can POST directly to
 * Cloudinary without ever seeing `CLOUDINARY_API_SECRET`.
 */
export function createSignedUploadParams(
  folderKey: CloudinaryFolderKey,
  options: { projectSlug?: string } = {}
): SignedUploadParams {
  if (!isCloudinaryConfigured()) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }
  const env = configure();
  const folder = resolveCloudinaryFolder(folderKey, options.projectSlug);
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.apiSecret
  );

  return {
    cloudName: env.cloudName,
    apiKey: env.apiKey,
    timestamp,
    signature,
    folder,
  };
}

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
};

/** Normalizes the raw Cloudinary upload-widget response into DB-ready fields. */
export function mapCloudinaryUploadResult(raw: {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
}): CloudinaryUploadResult {
  return {
    publicId: raw.public_id,
    secureUrl: raw.secure_url,
    resourceType: raw.resource_type,
    format: raw.format ?? null,
    bytes: typeof raw.bytes === "number" ? raw.bytes : null,
    width: typeof raw.width === "number" ? raw.width : null,
    height: typeof raw.height === "number" ? raw.height : null,
    duration: typeof raw.duration === "number" ? raw.duration : null,
  };
}

/**
 * Explicit, admin-triggered asset deletion only. Never call this
 * automatically from a "remove from form" action — orphaned assets in
 * Cloudinary are preferred over silently destroying media a client may
 * still need. See docs/phase-5-cloudinary-media.md.
 */
export async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<void> {
  if (!isCloudinaryConfigured()) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }
  configure();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
