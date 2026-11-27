"use server";

import { AdminRole } from "@/generated/prisma";
import { z } from "zod";
import {getCurrentAdmin} from "@/server/auth/require-admin";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  createSignedUploadParams,
  isCloudinaryConfigured,
  type CloudinaryFolderKey,
} from "@/server/services/cloudinary.service";

const folderKeys = [
  "library",
  "projects",
  "testimonials",
  "clientLogos",
  "brand",
  "hero",
  "og",
  "services",
] as const satisfies readonly CloudinaryFolderKey[];

const signatureSchema = z.object({
  folderKey: z.enum(folderKeys),
  projectSlug: z.string().trim().max(120).optional(),
});

export async function getCloudinaryUploadSignatureAction(
  folderKeyOrInput: CloudinaryFolderKey | unknown,
  projectSlug?: string
) {
  const input =
    typeof folderKeyOrInput === "string"
      ? signatureSchema.parse({ folderKey: folderKeyOrInput, projectSlug })
      : signatureSchema.parse(folderKeyOrInput);

  return withAdminMutation({ minimumRole: AdminRole.EDITOR }, async () => {
    const live=await getCurrentAdmin();if(!live||live.role==="VIEWER")throw new Error("ليس لديك صلاحية رفع الوسائط");
    if (!isCloudinaryConfigured()) {
      throw new Error("رفع الوسائط غير مُفعّل — أضف إعدادات Cloudinary أولًا");
    }
    return createSignedUploadParams(input.folderKey, {
      projectSlug: input.projectSlug,
    });
  });
}

export async function checkCloudinaryConfiguredAction() {
  return withAdminMutation({}, async () => ({
    configured: isCloudinaryConfigured(),
  }));
}
