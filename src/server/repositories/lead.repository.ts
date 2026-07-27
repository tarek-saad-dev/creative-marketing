import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { LeadInput } from "@/lib/validation";
import {
  LeadEventType,
  LeadSessionEventType,
  LeadStatus,
  type Prisma,
} from "@/generated/prisma";

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function createLeadSession(input: {
  sessionToken: string;
  source?: string | null;
  referrer?: string | null;
  landingUrl?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}) {
  return prisma.leadSession.create({
    data: {
      sessionToken: input.sessionToken,
      source: emptyToNull(input.source),
      referrer: emptyToNull(input.referrer),
      landingUrl: emptyToNull(input.landingUrl),
      utmSource: emptyToNull(input.utmSource),
      utmMedium: emptyToNull(input.utmMedium),
      utmCampaign: emptyToNull(input.utmCampaign),
      utmContent: emptyToNull(input.utmContent),
      utmTerm: emptyToNull(input.utmTerm),
    },
    select: { id: true, sessionToken: true, leadId: true },
  });
}

export async function findLeadSessionByToken(sessionToken: string) {
  return prisma.leadSession.findUnique({
    where: { sessionToken },
    select: {
      id: true,
      sessionToken: true,
      leadId: true,
      selectedPackageId: true,
      submittedAt: true,
    },
  });
}

export async function findLeadSessionById(sessionId: string) {
  return prisma.leadSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      sessionToken: true,
      leadId: true,
      selectedPackageId: true,
      submittedAt: true,
    },
  });
}

export async function addLeadSessionEvent(input: {
  sessionId: string;
  type: LeadSessionEventType;
  step?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.$transaction(async tx => {
    const event = await tx.leadSessionEvent.create({
      data: {
        sessionId: input.sessionId,
        type: input.type,
        step: emptyToNull(input.step),
        metadata: input.metadata,
      },
      select: { id: true, type: true },
    });

    await tx.leadSession.update({
      where: { id: input.sessionId },
      data: { lastActivityAt: new Date() },
    });

    return event;
  });
}

export async function setLeadSessionPackage(
  sessionId: string,
  packageId: string
) {
  return prisma.$transaction(async tx => {
    const session = await tx.leadSession.update({
      where: { id: sessionId },
      data: {
        selectedPackageId: packageId,
        lastActivityAt: new Date(),
      },
      select: { id: true, selectedPackageId: true },
    });

    await tx.leadSessionEvent.create({
      data: {
        sessionId,
        type: LeadSessionEventType.PACKAGE_SELECTED,
        step: "package",
        metadata: { packageId },
      },
    });

    return session;
  });
}

/**
 * Creates Lead, links LeadSession, records FORM_SUBMITTED on the session,
 * and records STATUS_CHANGED (NEW) as a CRM LeadEvent.
 */
export async function createLeadFromSession(input: {
  sessionId: string;
  leadInput: LeadInput;
  normalizedPhone: string;
}) {
  const { sessionId, leadInput, normalizedPhone } = input;

  return prisma.$transaction(async tx => {
    const session = await tx.leadSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        selectedPackageId: true,
        source: true,
        referrer: true,
        landingUrl: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        utmTerm: true,
        leadId: true,
      },
    });

    if (!session) {
      throw new Error("INVALID_SESSION");
    }
    if (session.leadId) {
      throw new Error("SESSION_ALREADY_SUBMITTED");
    }

    const packageId = leadInput.packageId ?? session.selectedPackageId ?? null;

    const lead = await tx.lead.create({
      data: {
        name: leadInput.name.trim(),
        phone: normalizedPhone,
        projectName: emptyToNull(leadInput.projectName),
        industry: emptyToNull(leadInput.industry),
        projectStage: emptyToNull(leadInput.projectStage),
        requestedService: emptyToNull(leadInput.requestedService),
        packageId,
        budgetRange: emptyToNull(leadInput.budgetRange),
        message: emptyToNull(leadInput.message),
        preferredContactMethod: emptyToNull(leadInput.preferredContactMethod),
        status: LeadStatus.NEW,
        source:
          emptyToNull(leadInput.source) ??
          emptyToNull(session.source) ??
          "website",
        referrer:
          emptyToNull(leadInput.referrer) ?? emptyToNull(session.referrer),
        landingUrl:
          emptyToNull(leadInput.landingUrl) ?? emptyToNull(session.landingUrl),
        utmSource:
          emptyToNull(leadInput.utmSource) ?? emptyToNull(session.utmSource),
        utmMedium:
          emptyToNull(leadInput.utmMedium) ?? emptyToNull(session.utmMedium),
        utmCampaign:
          emptyToNull(leadInput.utmCampaign) ??
          emptyToNull(session.utmCampaign),
        utmContent:
          emptyToNull(leadInput.utmContent) ?? emptyToNull(session.utmContent),
        utmTerm: emptyToNull(leadInput.utmTerm) ?? emptyToNull(session.utmTerm),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        projectName: true,
        industry: true,
        projectStage: true,
        requestedService: true,
        budgetRange: true,
        message: true,
        preferredContactMethod: true,
        packageId: true,
      },
    });

    const now = new Date();

    await tx.leadSession.update({
      where: { id: sessionId },
      data: {
        leadId: lead.id,
        selectedPackageId: packageId,
        submittedAt: now,
        lastActivityAt: now,
      },
    });

    await tx.leadSessionEvent.create({
      data: {
        sessionId,
        type: LeadSessionEventType.FORM_SUBMITTED,
        step: "submit",
        metadata: {
          leadId: lead.id,
          packageId,
        },
      },
    });

    await tx.leadEvent.create({
      data: {
        leadId: lead.id,
        type: LeadEventType.STATUS_CHANGED,
        metadata: {
          status: LeadStatus.NEW,
          reason: "form_submitted",
        },
      },
    });

    return lead;
  });
}

/** Legacy helper kept for direct submissions without a prior session. */
export async function createLeadWithSubmissionEvent(
  input: LeadInput,
  normalizedPhone: string,
  sessionToken?: string
) {
  return prisma.$transaction(async tx => {
    const session = await tx.leadSession.create({
      data: {
        sessionToken:
          sessionToken ??
          `direct_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        source: emptyToNull(input.source) ?? "website",
        referrer: emptyToNull(input.referrer),
        landingUrl: emptyToNull(input.landingUrl),
        utmSource: emptyToNull(input.utmSource),
        utmMedium: emptyToNull(input.utmMedium),
        utmCampaign: emptyToNull(input.utmCampaign),
        utmContent: emptyToNull(input.utmContent),
        utmTerm: emptyToNull(input.utmTerm),
        selectedPackageId: input.packageId ?? null,
      },
      select: { id: true },
    });

    await tx.leadSessionEvent.create({
      data: {
        sessionId: session.id,
        type: LeadSessionEventType.FORM_OPENED,
        step: "direct",
      },
    });

    const lead = await tx.lead.create({
      data: {
        name: input.name.trim(),
        phone: normalizedPhone,
        projectName: emptyToNull(input.projectName),
        industry: emptyToNull(input.industry),
        projectStage: emptyToNull(input.projectStage),
        requestedService: emptyToNull(input.requestedService),
        packageId: input.packageId ?? null,
        budgetRange: emptyToNull(input.budgetRange),
        message: emptyToNull(input.message),
        preferredContactMethod: emptyToNull(input.preferredContactMethod),
        status: LeadStatus.NEW,
        source: emptyToNull(input.source) ?? "website",
        referrer: emptyToNull(input.referrer),
        landingUrl: emptyToNull(input.landingUrl),
        utmSource: emptyToNull(input.utmSource),
        utmMedium: emptyToNull(input.utmMedium),
        utmCampaign: emptyToNull(input.utmCampaign),
        utmContent: emptyToNull(input.utmContent),
        utmTerm: emptyToNull(input.utmTerm),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        projectName: true,
        industry: true,
        projectStage: true,
        requestedService: true,
        budgetRange: true,
        message: true,
        preferredContactMethod: true,
        packageId: true,
      },
    });

    const now = new Date();
    await tx.leadSession.update({
      where: { id: session.id },
      data: {
        leadId: lead.id,
        submittedAt: now,
        lastActivityAt: now,
      },
    });

    await tx.leadSessionEvent.create({
      data: {
        sessionId: session.id,
        type: LeadSessionEventType.FORM_SUBMITTED,
        step: "submit",
        metadata: { leadId: lead.id },
      },
    });

    await tx.leadEvent.create({
      data: {
        leadId: lead.id,
        type: LeadEventType.STATUS_CHANGED,
        metadata: {
          status: LeadStatus.NEW,
          reason: "form_submitted",
        },
      },
    });

    return { lead, sessionId: session.id };
  });
}
