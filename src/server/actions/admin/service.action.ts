"use server";

import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  archiveServiceAdmin,
  createServiceAdmin,
  moveServiceAdmin,
  toggleServiceActiveAdmin,
  updateServiceAdmin,
} from "@/server/services/admin/service.admin.service";

export async function createServiceAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "service.create",
        entityType: "Service",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => createServiceAdmin(rawInput)
  );
}

export async function updateServiceAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "service.update",
        entityType: "Service",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => updateServiceAdmin(id, rawInput)
  );
}

export async function toggleServiceActiveAction(id: string, isActive: boolean) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: isActive ? "service.activate" : "service.deactivate",
        entityType: "Service",
        entityId: result.id,
      }),
    },
    () => toggleServiceActiveAdmin(id, isActive)
  );
}

export async function archiveServiceAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "service.archive",
        entityType: "Service",
        entityId: result.id,
      }),
    },
    () => archiveServiceAdmin(id)
  );
}

export async function moveServiceAction(id: string, direction: "up" | "down") {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "service.reorder",
        entityType: "Service",
        entityId: result.id,
        metadata: { direction, moved: result.moved },
      }),
    },
    () => moveServiceAdmin(id, direction)
  );
}
