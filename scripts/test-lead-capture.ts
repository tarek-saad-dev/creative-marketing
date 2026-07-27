/**
 * Development-only lead journey integration test against Neon.
 * Exercises LeadSession → events → Lead → CRM event, then deletes only test rows.
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
import { buildWhatsAppMessage } from "../src/server/services/whatsapp-message.service";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

const TEST_MARKER = `phase11_lead_test_${Date.now()}_${randomUUID().slice(0, 8)}`;

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  });
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
      where: { deletedAt: null },
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    });

    const session = await prisma.leadSession.create({
      data: {
        sessionToken: TEST_MARKER,
        source: "db:test-lead",
        landingUrl: "http://localhost:3000/?utm_source=phase11",
        utmSource: "phase11",
        utmCampaign: TEST_MARKER,
      },
      select: { id: true },
    });
    sessionId = session.id;

    await prisma.leadSessionEvent.create({
      data: {
        sessionId,
        type: LeadSessionEventType.FORM_OPENED,
        step: "start",
        metadata: { marker: TEST_MARKER },
      },
    });

    if (pkg) {
      await prisma.leadSession.update({
        where: { id: sessionId },
        data: {
          selectedPackageId: pkg.id,
          lastActivityAt: new Date(),
        },
      });
      await prisma.leadSessionEvent.create({
        data: {
          sessionId,
          type: LeadSessionEventType.PACKAGE_SELECTED,
          step: "package",
          metadata: { packageId: pkg.id },
        },
      });
    }

    await prisma.leadSessionEvent.create({
      data: {
        sessionId,
        type: LeadSessionEventType.STEP_COMPLETED,
        step: "details",
        metadata: { marker: TEST_MARKER },
      },
    });

    const phone = normalizePhone("+966500000099");
    const name = "Phase11 Test Lead";

    const result = await prisma.$transaction(async tx => {
      const lead = await tx.lead.create({
        data: {
          name,
          phone,
          projectName: `Test Project ${TEST_MARKER}`,
          industry: "testing",
          message: `Automated lead test ${TEST_MARKER}`,
          packageId: pkg?.id ?? null,
          status: LeadStatus.NEW,
          source: "db:test-lead",
          utmCampaign: TEST_MARKER,
          utmSource: "phase11",
        },
        select: {
          id: true,
          name: true,
          phone: true,
          projectName: true,
          industry: true,
          message: true,
          packageId: true,
        },
      });

      const now = new Date();
      await tx.leadSession.update({
        where: { id: sessionId! },
        data: {
          leadId: lead.id,
          submittedAt: now,
          lastActivityAt: now,
          selectedPackageId: pkg?.id ?? null,
        },
      });

      await tx.leadSessionEvent.create({
        data: {
          sessionId: sessionId!,
          type: LeadSessionEventType.FORM_SUBMITTED,
          step: "submit",
          metadata: { leadId: lead.id },
        },
      });

      await tx.leadEvent.create({
        data: {
          leadId: lead.id,
          type: LeadEventType.STATUS_CHANGED,
          metadata: { status: LeadStatus.NEW, reason: "form_submitted" },
        },
      });

      return lead;
    });

    leadId = result.id;

    const whatsappMessage = buildWhatsAppMessage({
      name: result.name,
      phone: result.phone,
      projectName: result.projectName ?? undefined,
      industry: result.industry ?? undefined,
      packageName: pkg?.name,
      message: result.message ?? undefined,
    });

    if (!whatsappMessage.includes(name)) {
      throw new Error("WhatsApp message missing lead name");
    }
    if (!whatsappMessage.includes("966500000099")) {
      throw new Error("WhatsApp message missing phone");
    }

    const linkedSession = await prisma.leadSession.findUnique({
      where: { id: sessionId },
      include: {
        events: { orderBy: { createdAt: "asc" } },
        lead: { include: { events: true } },
      },
    });

    if (!linkedSession) throw new Error("Session missing after submit");
    if (linkedSession.leadId !== leadId) {
      throw new Error("Session not linked to lead");
    }
    if (!linkedSession.submittedAt) {
      throw new Error("Session submittedAt missing");
    }

    const sessionTypes = linkedSession.events.map(event => event.type);
    const required = [
      "FORM_OPENED",
      ...(pkg ? (["PACKAGE_SELECTED"] as const) : []),
      "STEP_COMPLETED",
      "FORM_SUBMITTED",
    ];

    for (const type of required) {
      if (!sessionTypes.includes(type as (typeof sessionTypes)[number])) {
        throw new Error(`Missing session event: ${type}`);
      }
    }

    if (
      !linkedSession.lead?.events.some(
        event => event.type === LeadEventType.STATUS_CHANGED
      )
    ) {
      throw new Error("Missing CRM STATUS_CHANGED lead event");
    }

    console.log("Lead capture test passed.");
    console.log(`- Marker: ${TEST_MARKER}`);
    console.log(`- Session events: ${sessionTypes.join(" -> ")}`);
    console.log(`- Lead CRM events: ${linkedSession.lead.events.length}`);
    console.log(`- WhatsApp message length: ${whatsappMessage.length}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown lead test error";
    const safeMessage = message
      .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
      .replace(/postgres:\/\/[^\s"']+/gi, "postgres://***")
      .replace(/:[^:@/\s]+@/g, ":***@");
    console.error("Lead capture test failed:", safeMessage);
    process.exitCode = 1;
  } finally {
    if (sessionId) {
      await prisma.leadSessionEvent.deleteMany({ where: { sessionId } });
      await prisma.leadSession.deleteMany({ where: { id: sessionId } });
    } else {
      await prisma.leadSession.deleteMany({
        where: { sessionToken: TEST_MARKER },
      });
    }

    if (leadId) {
      await prisma.leadEvent.deleteMany({ where: { leadId } });
      await prisma.lead.deleteMany({ where: { id: leadId } });
    } else {
      await prisma.lead.deleteMany({ where: { utmCampaign: TEST_MARKER } });
    }

    await prisma.$disconnect();
  }
}

main();
