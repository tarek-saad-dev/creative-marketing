"use server";

import { ZodError } from "zod";
import { captureLead } from "@/server/services/lead-capture.service";
import { leadInputSchema } from "@/lib/validation";

export type SubmitLeadSuccess = {
  ok: true;
  leadId: string;
  whatsappMessage: string;
  whatsappUrl: string | null;
  alreadySubmitted?: boolean;
};

export type SubmitLeadFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type SubmitLeadResult = SubmitLeadSuccess | SubmitLeadFailure;

/**
 * Extension point: rate limiting / spam protection should wrap this action later.
 * Lightweight guards: honeypot + min completion time (in captureLead).
 */
export async function submitLeadAction(
  rawInput: unknown,
  options: { sessionId?: string } = {}
): Promise<SubmitLeadResult> {
  try {
    leadInputSchema.parse(rawInput);

    const result = await captureLead(rawInput, {
      sessionId: options.sessionId,
    });

    return {
      ok: true,
      leadId: result.leadId,
      whatsappMessage: result.whatsappMessage,
      whatsappUrl: result.whatsappUrl,
      alreadySubmitted: result.alreadySubmitted,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of error.issues) {
        const key = issue.path.join(".") || "_form";
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      return {
        ok: false,
        error: "بيانات غير صالحة",
        fieldErrors,
      };
    }

    if (error instanceof Error) {
      if (error.message === "INVALID_PHONE") {
        return { ok: false, error: "رقم الجوال غير صالح" };
      }
      if (error.message === "INVALID_PACKAGE") {
        return { ok: false, error: "الباكدج المحدد غير متاح" };
      }
      if (error.message === "INVALID_SESSION") {
        return { ok: false, error: "الجلسة غير صالحة" };
      }
      if (error.message === "SESSION_ALREADY_SUBMITTED") {
        return { ok: false, error: "تم إرسال هذا النموذج مسبقًا" };
      }
      if (error.message === "SPAM_REJECTED" || error.message === "TOO_FAST") {
        return { ok: false, error: "تعذر إرسال الطلب. حاول مرة أخرى." };
      }
    }

    return {
      ok: false,
      error: "تعذر إرسال الطلب. حاول مرة أخرى لاحقًا.",
    };
  }
}
