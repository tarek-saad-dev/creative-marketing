import "server-only";

import { LeadEventType, LeadStatus } from "@/generated/prisma";
import {
  leadAssignmentSchema,
  leadInternalNoteSchema,
  leadStatusUpdateSchema,
} from "@/lib/validation/admin/lead";
import {
  assignLeadRow,
  createLeadEventRow,
  findLeadByIdForAdmin,
  listLeadsForAdmin,
  updateLeadInternalNoteRow,
  updateLeadStatusRow,
} from "@/server/repositories/admin/lead.admin.repository";
import { findAdminUserById } from "@/server/repositories/admin-user.repository";
import { revalidatePath } from "next/cache";

const STATUS_TO_EVENT: Partial<Record<LeadStatus, LeadEventType>> = {
  CONTACTED: LeadEventType.CONTACTED,
  QUALIFIED: LeadEventType.QUALIFIED,
  WON: LeadEventType.WON,
  LOST: LeadEventType.LOST,
};

const ALLOWED: Record<LeadStatus, LeadStatus[]> = {
  NEW: [LeadStatus.CONTACTED, LeadStatus.ARCHIVED],
  CONTACTED: [LeadStatus.QUALIFIED, LeadStatus.ARCHIVED],
  QUALIFIED: [LeadStatus.WON, LeadStatus.LOST, LeadStatus.ARCHIVED],
  WON: [LeadStatus.ARCHIVED],
  LOST: [LeadStatus.ARCHIVED],
  ARCHIVED: [],
};

export function isLeadTransitionAllowed(
  from: LeadStatus,
  to: LeadStatus,
  allowCorrection: boolean
): boolean {
  if (from === to) return false;
  if (ALLOWED[from]?.includes(to)) return true;
  return allowCorrection;
}

export async function listAdminLeads(
  options: Parameters<typeof listLeadsForAdmin>[0] = {}
) {
  return listLeadsForAdmin(options);
}

export async function getAdminLeadById(id: string) {
  return findLeadByIdForAdmin(id);
}

export async function updateLeadStatusAdmin(
  id: string,
  rawInput: unknown,
  options: { allowCorrection?: boolean } = {}
) {
  const input = leadStatusUpdateSchema.parse(rawInput);
  const current = await findLeadByIdForAdmin(id);
  if (!current) throw new Error("الطلب غير موجود");

  if (
    !isLeadTransitionAllowed(
      current.status,
      input.status,
      Boolean(options.allowCorrection)
    )
  ) {
    throw new Error(
      `لا يمكن الانتقال من ${current.status} إلى ${input.status} بهذه الصلاحية`
    );
  }

  const lead = await updateLeadStatusRow(id, input.status);
  const eventType =
    STATUS_TO_EVENT[input.status] ?? LeadEventType.STATUS_CHANGED;
  await createLeadEventRow(id, eventType, {
    from: current.status,
    to: input.status,
    correction: Boolean(options.allowCorrection),
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  return lead;
}

/** Internal note is admin-only — never surface publicly or log body in audit. */
export async function updateLeadInternalNoteAdmin(
  id: string,
  rawInput: unknown
) {
  const input = leadInternalNoteSchema.parse(rawInput);
  const note = input.internalNote?.trim() || null;
  const updated = await updateLeadInternalNoteRow(id, note);
  revalidatePath(`/admin/leads/${id}`);
  return updated;
}

export async function assignLeadAdmin(id: string, rawInput: unknown) {
  const input = leadAssignmentSchema.parse(rawInput);

  if (input.assignedAdminId) {
    const admin = await findAdminUserById(input.assignedAdminId);
    if (!admin || admin.deletedAt || !admin.isActive) {
      throw new Error("لا يمكن التعيين — المسؤول غير موجود أو غير نشط");
    }
  }

  return assignLeadRow(id, input.assignedAdminId);
}
