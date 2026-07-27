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
