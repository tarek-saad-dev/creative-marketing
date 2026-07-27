/**
 * Lead CRM status transition + event + cleanup.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db/client";
import { LeadEventType, LeadStatus } from "../src/generated/prisma";

async function main() {
  const lead = await prisma.lead.create({
    data: {
      name: "CRM Probe",
      phone: "0500000099",
      status: LeadStatus.NEW,
      source: "admin-test",
      projectName: "CRM Probe Project",
    },
  });
  console.log("OK  lead created");

  const listed = await prisma.lead.findMany({
    where: { id: lead.id },
    take: 1,
  });
  if (listed.length !== 1) throw new Error("list failed");
  console.log("OK  list query");

  const detail = await prisma.lead.findUnique({ where: { id: lead.id } });
  if (!detail) throw new Error("detail failed");
  console.log("OK  detail query");

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: LeadStatus.CONTACTED },
  });
  await prisma.leadEvent.create({
    data: {
      leadId: lead.id,
      type: LeadEventType.STATUS_CHANGED,
      metadata: { from: "NEW", to: "CONTACTED" },
    },
  });
  console.log("OK  status + LeadEvent");

  const admin = await prisma.adminUser.findFirst({
    where: { deletedAt: null },
  });
  if (admin) {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "LEAD_STATUS_CHANGED",
        entityType: "Lead",
        entityId: lead.id,
        metadata: { from: "NEW", to: "CONTACTED" },
      },
    });
    console.log("OK  AdminAuditLog");
    await prisma.adminAuditLog.deleteMany({
      where: { entityId: lead.id, action: "LEAD_STATUS_CHANGED" },
    });
  } else {
    console.log("SKIP AdminAuditLog (no admin user yet)");
  }

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: LeadStatus.ARCHIVED },
  });
  console.log("OK  archived");

  await prisma.leadEvent.deleteMany({ where: { leadId: lead.id } });
  await prisma.lead.delete({ where: { id: lead.id } });
  console.log("OK  cleaned up");
  console.log("admin:test-leads passed");
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
