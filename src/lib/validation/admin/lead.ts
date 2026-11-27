import { z } from "zod";

export const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
  "ARCHIVED",
]);

export const leadStatusUpdateSchema = z.object({
  status: leadStatusSchema,
});

export const leadInternalNoteSchema = z.object({
  internalNote: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const leadAssignmentSchema = z.object({
  assignedAdminId: z.string().trim().min(1).nullable(),
});

import {isDateOnly} from "@/lib/admin/lead-crm";
export const leadCrmEventSchema=z.discriminatedUnion("kind",[z.object({kind:z.literal("followup"),dueDate:z.string().refine(isDateOnly,"تاريخ غير صالح").nullable()}),z.object({kind:z.literal("contact"),channel:z.enum(["whatsapp","phone","meeting","other"]),note:z.string().trim().min(1,"اكتب نتيجة التواصل").max(2000)})]);
