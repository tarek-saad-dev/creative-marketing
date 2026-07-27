"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { LeadSessionEventType } from "@/generated/prisma";
import {
  addLeadSessionEvent,
  createLeadSession,
  findLeadSessionByToken,
  setLeadSessionPackage,
} from "@/server/repositories/lead.repository";
import { findPublicPackageById } from "@/server/repositories/package.repository";

const openSessionSchema = z.object({
  sessionToken: z.string().trim().min(16).max(120).optional(),
  source: z.string().trim().max(80).optional(),
  referrer: z.string().trim().max(500).optional(),
  landingUrl: z.string().trim().max(500).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  utmContent: z.string().trim().max(120).optional(),
  utmTerm: z.string().trim().max(120).optional(),
  cta: z.string().trim().max(80).optional(),
});

export type OpenLeadSessionResult =
  | {
      ok: true;
      sessionId: string;
      sessionToken: string;
      alreadySubmitted: boolean;
    }
  | { ok: false; error: string };

export async function openLeadSessionAction(
  raw: unknown
): Promise<OpenLeadSessionResult> {
  try {
    const input = openSessionSchema.parse(raw);
    const token = input.sessionToken?.trim() || randomUUID();

    const existing = await findLeadSessionByToken(token);
    if (existing) {
      if (!existing.leadId) {
        await addLeadSessionEvent({
          sessionId: existing.id,
          type: LeadSessionEventType.FORM_OPENED,
          step: "resume",
          metadata: { cta: input.cta ?? null },
        });
      }
      return {
        ok: true,
        sessionId: existing.id,
        sessionToken: existing.sessionToken,
        alreadySubmitted: Boolean(existing.leadId),
      };
    }

    const session = await createLeadSession({
      sessionToken: token,
      source: input.source,
      referrer: input.referrer,
      landingUrl: input.landingUrl,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      utmContent: input.utmContent,
      utmTerm: input.utmTerm,
    });

    await addLeadSessionEvent({
      sessionId: session.id,
      type: LeadSessionEventType.FORM_OPENED,
      step: "open",
      metadata: { cta: input.cta ?? null },
    });

    return {
      ok: true,
      sessionId: session.id,
      sessionToken: session.sessionToken,
      alreadySubmitted: false,
    };
  } catch {
    return { ok: false, error: "تعذر بدء الجلسة" };
  }
}

export async function selectLeadPackageAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const schema = z.object({
      sessionId: z.string().cuid(),
      packageId: z.string().cuid().nullable(),
      isCustom: z.boolean().optional(),
    });
    const input = schema.parse(raw);

    if (input.isCustom || !input.packageId) {
      await addLeadSessionEvent({
        sessionId: input.sessionId,
        type: LeadSessionEventType.PACKAGE_SELECTED,
        step: "package",
        metadata: { custom: true },
      });
      return { ok: true };
    }

    const pkg = await findPublicPackageById(input.packageId);
    if (!pkg) return { ok: false, error: "الباكدج غير متاح" };

    await setLeadSessionPackage(input.sessionId, input.packageId);
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذر حفظ اختيار الباكدج" };
  }
}

export async function recordLeadStepAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const schema = z.object({
      sessionId: z.string().cuid(),
      step: z.string().trim().min(1).max(40),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });
    const input = schema.parse(raw);

    await addLeadSessionEvent({
      sessionId: input.sessionId,
      type: LeadSessionEventType.STEP_COMPLETED,
      step: input.step,
      metadata: input.metadata as never,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذر تسجيل الخطوة" };
  }
}

export async function recordWhatsAppOpenedAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const schema = z.object({
      sessionId: z.string().cuid(),
      via: z.enum(["auto", "retry", "copy"]).optional(),
    });
    const input = schema.parse(raw);
    await addLeadSessionEvent({
      sessionId: input.sessionId,
      type: LeadSessionEventType.WHATSAPP_OPENED,
      step: "whatsapp",
      metadata: { via: input.via ?? "auto" },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذر تسجيل حدث واتساب" };
  }
}

export async function recordLeadAbandonedAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const schema = z.object({
      sessionId: z.string().cuid(),
      step: z.string().trim().max(40).optional(),
    });
    const input = schema.parse(raw);
    await addLeadSessionEvent({
      sessionId: input.sessionId,
      type: LeadSessionEventType.FORM_ABANDONED,
      step: input.step ?? "close",
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذر تسجيل الإغلاق" };
  }
}
