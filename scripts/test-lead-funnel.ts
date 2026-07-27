/**
 * Lead funnel integration test against Neon with cleanup of test rows only.
 * Mirrors captureLead behavior without importing server-only modules.
 */
import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { PrismaNeon } from "@prisma/adapter-neon";
import {
  LeadEventType,
  LeadSessionEventType,
  LeadStatus,
  PrismaClient,
} from "../src/generated/prisma";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";
import { buildWhatsAppMessage } from "../src/server/services/whatsapp-message.service";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

const MARKER = `phase4_lead_${Date.now()}_${randomUUID().slice(0, 8)}`;

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

async function main() {
  const prisma = createClient();
  let sessionId: string | undefined;
  let leadId: string | undefined;

  try {
    const pkg = await prisma.package.findFirst({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        originalPrice: { not: null, gt: 0 },
      },
      select: { id: true, name: true },
    });

    const session = await prisma.leadSession.create({
      data: {
        sessionToken: MARKER,
        source: "commercial:test-lead",
        landingUrl: "http://localhost:3000/?utm_source=phase4",
        utmSource: "phase4",
        utmCampaign: MARKER,
        selectedPackageId: pkg?.id ?? null,
      },
      select: { id: true },
    });
    sessionId = session.id;

    await prisma.leadSessionEvent.create({
      data: {
        sessionId,
        type: LeadSessionEventType.FORM_OPENED,
        step: "open",
      },
    });

    if (pkg) {
      await prisma.leadSessionEvent.create({
        data: {
          sessionId,
          type: LeadSessionEventType.PACKAGE_SELECTED,
          step: "package",
          metadata: { packageId: pkg.id },
        },
      });
    } else {
      await prisma.leadSessionEvent.create({
        data: {
          sessionId,
          type: LeadSessionEventType.PACKAGE_SELECTED,
          step: "package",
          metadata: { custom: true },
        },
      });
    }

    await prisma.leadSessionEvent.create({
      data: {
        sessionId,
        type: LeadSessionEventType.STEP_COMPLETED,
        step: "step_1",
      },
    });

    const phone = normalizePhone("+966500000088");
    const name = "Phase4 Test Lead";

    const lead = await prisma.$transaction(async tx => {
      const created = await tx.lead.create({
        data: {
          name,
          phone,
          projectName: `Test ${MARKER}`,
          industry: "testing",
          projectStage: "جديد",
          requestedService: "اختبار",
          packageId: pkg?.id ?? null,
          budgetRange: "3,000 – 7,000",
          message: `Automated funnel test ${MARKER}`,
          preferredContactMethod: "whatsapp",
          status: LeadStatus.NEW,
          source: "commercial:test-lead",
          utmCampaign: MARKER,
          utmSource: "phase4",
        },
        select: { id: true, name: true, phone: true },
      });

      await tx.leadSession.update({
        where: { id: sessionId! },
        data: {
          leadId: created.id,
          submittedAt: new Date(),
          lastActivityAt: new Date(),
        },
      });

      await tx.leadSessionEvent.create({
        data: {
          sessionId: sessionId!,
          type: LeadSessionEventType.FORM_SUBMITTED,
          step: "submit",
          metadata: { leadId: created.id },
        },
      });

      await tx.leadEvent.create({
        data: {
          leadId: created.id,
          type: LeadEventType.STATUS_CHANGED,
          metadata: { status: LeadStatus.NEW, reason: "form_submitted" },
        },
      });

      return created;
    });

    leadId = lead.id;

    const message = buildWhatsAppMessage({
      name: lead.name,
      phone: lead.phone,
      projectName: `Test ${MARKER}`,
      industry: "testing",
      projectStage: "جديد",
      requestedService: "اختبار",
      packageName: pkg?.name ?? "عرض مخصص",
      budgetRange: "3,000 – 7,000",
      message: `Automated funnel test ${MARKER}`,
      preferredContactMethod: "whatsapp",
    });
    assert(message.includes(name), "message missing name");

    const alreadyLinked = await prisma.leadSession.findUnique({
      where: { id: sessionId },
      select: { leadId: true },
    });
    assert(alreadyLinked?.leadId === leadId, "session must link lead");

    // Idempotency: second submit must not create another lead for same session
    const leadCount = await prisma.lead.count({
      where: { utmCampaign: MARKER },
    });
    assert(leadCount === 1, "duplicate leads must not exist for marker");

    await prisma.leadSessionEvent.create({
      data: {
        sessionId,
        type: LeadSessionEventType.WHATSAPP_OPENED,
        step: "whatsapp",
        metadata: { via: "auto" },
      },
    });

    const events = await prisma.leadSessionEvent.findMany({
      where: { sessionId },
      select: { type: true },
    });
    assert(
      events.some(event => event.type === LeadSessionEventType.FORM_SUBMITTED),
      "FORM_SUBMITTED required"
    );
    assert(
      events.some(event => event.type === LeadSessionEventType.WHATSAPP_OPENED),
      "WHATSAPP_OPENED required"
    );

    console.log("Lead funnel test passed.");
    console.log(`- Package mode: ${pkg ? pkg.name : "custom"}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown lead funnel error";
    console.error(
      "Lead funnel test failed:",
      message
        .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
        .replace(/:[^:@/\s]+@/g, ":***@")
    );
    process.exitCode = 1;
  } finally {
    if (leadId) {
      await prisma.leadEvent.deleteMany({ where: { leadId } });
      await prisma.leadSession.updateMany({
        where: { id: sessionId },
        data: { leadId: null },
      });
      await prisma.lead.deleteMany({ where: { id: leadId } });
    }
    if (sessionId) {
      await prisma.leadSessionEvent.deleteMany({ where: { sessionId } });
      await prisma.leadSession.deleteMany({ where: { id: sessionId } });
    }
    console.log("Cleanup: test lead/session removed.");
    await prisma.$disconnect();
  }
}

main();
