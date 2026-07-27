"use server";

import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  createFaqAdmin,
  deleteFaqAdmin,
  moveFaqAdmin,
  updateFaqAdmin,
} from "@/server/services/admin/faq.admin.service";

export async function createFaqAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "faq.create",
        entityType: "FAQ",
        entityId: result.id,
      }),
    },
    () => createFaqAdmin(rawInput)
  );
}

export async function updateFaqAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "faq.update",
        entityType: "FAQ",
        entityId: result.id,
      }),
    },
    () => updateFaqAdmin(id, rawInput)
  );
}

export async function deleteFaqAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "faq.delete",
        entityType: "FAQ",
        entityId: result.id,
      }),
    },
    () => deleteFaqAdmin(id)
  );
}

export async function moveFaqAction(id: string, direction: "up" | "down") {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "faq.reorder",
        entityType: "FAQ",
        entityId: result.id,
        metadata: { direction, moved: result.moved },
      }),
    },
    () => moveFaqAdmin(id, direction)
  );
}
