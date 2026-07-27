import "server-only";

import { leadInputSchema, type LeadInput } from "@/lib/validation";
import {
  createLeadFromSession,
  createLeadWithSubmissionEvent,
  findLeadSessionById,
} from "@/server/repositories/lead.repository";
import { findPublicPackageById } from "@/server/repositories/package.repository";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/server/services/whatsapp-message.service";
import { getAllSiteSettings } from "@/server/repositories/site-settings.repository";

/**
 * Normalize phone without guessing a country code.
 * Keeps digits and a single leading + when present.
 */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export type LeadCaptureResult = {
  leadId: string;
  sessionId?: string;
  whatsappMessage: string;
  whatsappUrl: string | null;
  alreadySubmitted?: boolean;
};

export type CaptureLeadOptions = {
  sessionId?: string;
};

const MIN_FORM_MS = 2500;

export async function captureLead(
  rawInput: unknown,
  options: CaptureLeadOptions = {}
): Promise<LeadCaptureResult> {
  const input: LeadInput = leadInputSchema.parse(rawInput);

  if (input.website && input.website.length > 0) {
    throw new Error("SPAM_REJECTED");
  }

  if (input.formOpenedAt) {
    const elapsed = Date.now() - input.formOpenedAt;
    if (elapsed >= 0 && elapsed < MIN_FORM_MS) {
      throw new Error("TOO_FAST");
    }
  }

  const normalizedPhone = normalizePhone(input.phone);

  if (normalizedPhone.replace(/\D/g, "").length < 8) {
    throw new Error("INVALID_PHONE");
  }

  let packageName: string | undefined;
  let packageId = input.packageId ?? null;

  if (input.isCustomPackage) {
    packageId = null;
    packageName = "عرض مخصص";
  } else if (packageId) {
    const pkg = await findPublicPackageById(packageId);
    if (!pkg) {
      throw new Error("INVALID_PACKAGE");
    }
    packageName = pkg.name;
  }

  const leadPayload: LeadInput = {
    ...input,
    packageId,
  };

  if (options.sessionId) {
    const existing = await findLeadSessionById(options.sessionId);
    if (!existing) throw new Error("INVALID_SESSION");
    if (existing.leadId) {
      const settings = await getAllSiteSettings();
      const whatsappDigits =
        typeof settings["brand.whatsapp"] === "string"
          ? settings["brand.whatsapp"].replace(/\D/g, "")
          : "";
      const whatsappMessage = buildWhatsAppMessage({
        name: input.name,
        phone: normalizedPhone,
        projectName: input.projectName || undefined,
        industry: input.industry || undefined,
        projectStage: input.projectStage || undefined,
        requestedService: input.requestedService || undefined,
        packageName,
        budgetRange: input.budgetRange || undefined,
        message: input.message || undefined,
        preferredContactMethod: input.preferredContactMethod || undefined,
      });
      return {
        leadId: existing.leadId,
        sessionId: options.sessionId,
        whatsappMessage,
        whatsappUrl: buildWhatsAppUrl(
          whatsappDigits.length >= 8 ? whatsappDigits : null,
          whatsappMessage
        ),
        alreadySubmitted: true,
      };
    }
  }

  let lead: {
    id: string;
    name: string;
    phone: string;
    projectName: string | null;
    industry: string | null;
    projectStage?: string | null;
    requestedService: string | null;
    budgetRange?: string | null;
    message: string | null;
    preferredContactMethod?: string | null;
    packageId: string | null;
  };
  let sessionId: string | undefined;

  if (options.sessionId) {
    lead = await createLeadFromSession({
      sessionId: options.sessionId,
      leadInput: leadPayload,
      normalizedPhone,
    });
    sessionId = options.sessionId;
  } else {
    const created = await createLeadWithSubmissionEvent(
      leadPayload,
      normalizedPhone
    );
    lead = created.lead;
    sessionId = created.sessionId;
  }

  if (!packageName && lead.packageId) {
    const pkg = await findPublicPackageById(lead.packageId);
    packageName = pkg?.name;
  }

  const whatsappMessage = buildWhatsAppMessage({
    name: lead.name,
    phone: lead.phone,
    projectName: lead.projectName ?? undefined,
    industry: lead.industry ?? undefined,
    projectStage: lead.projectStage ?? input.projectStage ?? undefined,
    requestedService: lead.requestedService ?? undefined,
    packageName,
    budgetRange: lead.budgetRange ?? input.budgetRange ?? undefined,
    message: lead.message ?? undefined,
    preferredContactMethod:
      lead.preferredContactMethod ?? input.preferredContactMethod ?? undefined,
  });

  const settings = await getAllSiteSettings();
  const whatsappDigits =
    typeof settings["brand.whatsapp"] === "string"
      ? settings["brand.whatsapp"].replace(/\D/g, "")
      : "";

  return {
    leadId: lead.id,
    sessionId,
    whatsappMessage,
    whatsappUrl: buildWhatsAppUrl(
      whatsappDigits.length >= 8 ? whatsappDigits : null,
      whatsappMessage
    ),
  };
}
