"use server";

import { AdminRole } from "@/generated/prisma";
import { z } from "zod";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import { leadStatusUpdateSchema } from "@/lib/validation/admin/lead";
import {
  assignLeadAdmin,
  updateLeadInternalNoteAdmin,
  updateLeadStatusAdmin,
} from "@/server/services/admin/lead.admin.service";

export async function updateLeadStatusAction(id: string, rawInput: unknown) {
  const parsed = z
    .object({
      status: leadStatusUpdateSchema.shape.status,
      confirmCorrection: z.boolean().optional(),
    })
    .parse(rawInput);

  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: (result: Awaited<ReturnType<typeof updateLeadStatusAdmin>>) => ({
        action: "lead.status_change",
        entityType: "Lead",
        entityId: result.id,
        metadata: {
          status: result.status,
          correction: Boolean(parsed.confirmCorrection),
        },
      }),
    },
    async user => {
      const allowCorrection =
        Boolean(parsed.confirmCorrection) &&
        (user.role === AdminRole.OWNER || user.role === AdminRole.ADMIN);
      return updateLeadStatusAdmin(
        id,
        { status: parsed.status },
        { allowCorrection }
      );
    }
  );
}

/** Never logs the note body — only that a note was updated. */
export async function updateLeadInternalNoteAction(
  id: string,
  rawInput: unknown
) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "lead.note_update",
        entityType: "Lead",
        entityId: result.id,
        metadata: { updated: true },
      }),
    },
    () => updateLeadInternalNoteAdmin(id, rawInput)
  );
}

export async function assignLeadAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "lead.assign",
        entityType: "Lead",
        entityId: result.id,
        metadata: { assignedAdminId: result.assignedAdmin?.id ?? null },
      }),
    },
    () => assignLeadAdmin(id, rawInput)
  );
}
