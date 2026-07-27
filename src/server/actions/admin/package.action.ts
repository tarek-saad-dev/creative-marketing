"use server";

import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  archivePackageAdmin,
  createPackageAdmin,
  publishPackageAdmin,
  softDeletePackageAdmin,
  unpublishPackageAdmin,
  updatePackageAdmin,
} from "@/server/services/admin/package.admin.service";

export async function createPackageAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "package.create",
        entityType: "Package",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => createPackageAdmin(rawInput)
  );
}

export async function updatePackageAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "package.update",
        entityType: "Package",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => updatePackageAdmin(id, rawInput)
  );
}

export async function publishPackageAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "package.publish",
        entityType: "Package",
        entityId: result.id,
      }),
    },
    () => publishPackageAdmin(id)
  );
}

export async function unpublishPackageAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "package.unpublish",
        entityType: "Package",
        entityId: result.id,
      }),
    },
    () => unpublishPackageAdmin(id)
  );
}

export async function archivePackageAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "package.archive",
        entityType: "Package",
        entityId: result.id,
      }),
    },
    () => archivePackageAdmin(id)
  );
}

export async function softDeletePackageAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "package.soft_delete",
        entityType: "Package",
        entityId: result.id,
      }),
    },
    () => softDeletePackageAdmin(id)
  );
}
