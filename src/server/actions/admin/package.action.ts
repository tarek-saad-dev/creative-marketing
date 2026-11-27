"use server";

import { AdminRole } from "@/generated/prisma";
import {getCurrentAdmin} from "@/server/auth/require-admin";
import {canEditCommercial} from "@/lib/admin/roles";
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
    async () => {const user=await getCurrentAdmin();if(!user||user.role==="VIEWER")throw new Error("غير مصرح");return createPackageAdmin(rawInput,canEditCommercial(user.role));}
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
    async () => {const user=await getCurrentAdmin();if(!user||user.role==="VIEWER")throw new Error("غير مصرح");return updatePackageAdmin(id,rawInput,canEditCommercial(user.role));}
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
    async () => {const user=await getCurrentAdmin();if(!user||!canEditCommercial(user.role))throw new Error("غير مصرح");return publishPackageAdmin(id);}
  );
}

export async function unpublishPackageAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "package.unpublish",
        entityType: "Package",
        entityId: result.id,
      }),
    },
    async () => {const user=await getCurrentAdmin();if(!user||!canEditCommercial(user.role))throw new Error("غير مصرح");return unpublishPackageAdmin(id);}
  );
}

export async function archivePackageAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "package.archive",
        entityType: "Package",
        entityId: result.id,
      }),
    },
    async () => {const user=await getCurrentAdmin();if(!user||!canEditCommercial(user.role))throw new Error("غير مصرح");return archivePackageAdmin(id);}
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
    async () => {const user=await getCurrentAdmin();if(!user||!canEditCommercial(user.role))throw new Error("غير مصرح");return softDeletePackageAdmin(id);}
  );
}
