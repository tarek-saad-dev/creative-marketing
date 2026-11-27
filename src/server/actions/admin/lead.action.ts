"use server";

import { AdminRole } from "@/generated/prisma";
import { z } from "zod";
import {getCurrentAdmin} from "@/server/auth/require-admin";
import {writeLeadCrmEvent} from "@/server/repositories/admin/lead.admin.repository";
import {leadCrmEventSchema} from "@/lib/validation/admin/lead";
import {revalidatePath} from "next/cache";
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
      await requireCrmAdmin();
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
    async () => {await requireCrmAdmin();return updateLeadInternalNoteAdmin(id,rawInput);}
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
    async () => {await requireCrmAdmin();return assignLeadAdmin(id,rawInput);}
  );
}

async function requireCrmAdmin(){const user=await getCurrentAdmin();if(!user||!["ADMIN","OWNER"].includes(user.role))throw new Error("ليس لديك صلاحية إدارة العملاء");return user;}
export async function addLeadCrmEventAction(id:string,raw:unknown){
 return withAdminMutation({minimumRole:AdminRole.ADMIN,audit:r=>({action:"lead.crm."+r.kind,entityType:"Lead",entityId:r.id})},async()=>{
 const user=await requireCrmAdmin();const input=leadCrmEventSchema.parse(raw);
 const result=input.kind==="followup"?await writeLeadCrmEvent(id,{crmKind:"followup",dueDate:input.dueDate,actor:user.name}):await writeLeadCrmEvent(id,{crmKind:"contact",note:input.note,channel:input.channel,actor:user.name});revalidatePath("/admin/leads");revalidatePath("/admin");revalidatePath(`/admin/leads/${id}`);return {...result,kind:input.kind};
 });
}
