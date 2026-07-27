/**
 * Read-only audit for Phase 5 / verification test markers.
 *
 * Usage:
 *   npx tsx scripts/audit-phase-5-test-data.ts
 *   npx tsx scripts/audit-phase-5-test-data.ts --cleanup
 *
 * Cleanup only deletes rows whose markers match known test prefixes/emails
 * and that were clearly created by verification scripts. Never broad deletes.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db/client";

const MARKERS = [
  "preview-probe-",
  "auth-test-",
  "verify-admin-",
  "phase5c-",
  "phase5b-",
  "tmp-case-study-",
  "tmp-admin-",
  "@example.invalid",
  "Preview Probe",
  "Auth Test",
  "Verify Admin",
];

/** Never auto-clean these local operator accounts. */
const PROTECTED_EMAILS = new Set(["owner@example.com", "admin@example.com"]);

const cleanup = process.argv.includes("--cleanup");

type Hit = {
  table: string;
  id: string;
  label: string;
  reason: string;
};

function matchesMarker(value: string | null | undefined): string | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  for (const marker of MARKERS) {
    if (lower.includes(marker.toLowerCase())) return marker;
  }
  return null;
}

async function main() {
  const hits: Hit[] = [];

  const admins = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true },
  });
  for (const row of admins) {
    if (PROTECTED_EMAILS.has(row.email.toLowerCase())) continue;
    const reason = matchesMarker(row.email) ?? matchesMarker(row.name) ?? null;
    if (reason) {
      hits.push({
        table: "AdminUser",
        id: row.id,
        label: row.email,
        reason,
      });
    }
  }

  const projects = await prisma.project.findMany({
    select: { id: true, slug: true, title: true, status: true },
  });
  for (const row of projects) {
    const reason = matchesMarker(row.slug) ?? matchesMarker(row.title) ?? null;
    if (reason) {
      hits.push({
        table: "Project",
        id: row.id,
        label: `${row.slug} (${row.status})`,
        reason,
      });
    }
  }

  const packages = await prisma.package.findMany({
    select: { id: true, slug: true, name: true, status: true },
  });
  for (const row of packages) {
    const reason = matchesMarker(row.slug) ?? matchesMarker(row.name) ?? null;
    if (reason) {
      hits.push({
        table: "Package",
        id: row.id,
        label: `${row.slug} (${row.status})`,
        reason,
      });
    }
  }

  const offers = await prisma.limitedOffer.findMany({
    select: { id: true, slug: true, name: true, status: true },
  });
  for (const row of offers) {
    const reason = matchesMarker(row.slug) ?? matchesMarker(row.name) ?? null;
    if (reason) {
      hits.push({
        table: "LimitedOffer",
        id: row.id,
        label: `${row.slug} (${row.status})`,
        reason,
      });
    }
  }

  const testimonials = await prisma.testimonial.findMany({
    select: { id: true, clientName: true, projectName: true, status: true },
  });
  for (const row of testimonials) {
    const reason =
      matchesMarker(row.clientName) ?? matchesMarker(row.projectName) ?? null;
    if (reason) {
      hits.push({
        table: "Testimonial",
        id: row.id,
        label: `${row.clientName} (${row.status})`,
        reason,
      });
    }
  }

  const metrics = await prisma.trustMetric.findMany({
    select: { id: true, key: true, label: true },
  });
  for (const row of metrics) {
    const reason = matchesMarker(row.key) ?? matchesMarker(row.label) ?? null;
    if (reason) {
      hits.push({
        table: "TrustMetric",
        id: row.id,
        label: row.key,
        reason,
      });
    }
  }

  const logos = await prisma.clientLogo.findMany({
    select: { id: true, name: true },
  });
  for (const row of logos) {
    const reason = matchesMarker(row.name);
    if (reason) {
      hits.push({
        table: "ClientLogo",
        id: row.id,
        label: row.name,
        reason,
      });
    }
  }

  const faqs = await prisma.fAQ.findMany({
    select: { id: true, slug: true, question: true },
  });
  for (const row of faqs) {
    const reason =
      matchesMarker(row.slug) ?? matchesMarker(row.question) ?? null;
    if (reason) {
      hits.push({
        table: "FAQ",
        id: row.id,
        label: row.slug,
        reason,
      });
    }
  }

  const leads = await prisma.lead.findMany({
    select: { id: true, name: true, projectName: true, source: true },
  });
  for (const row of leads) {
    const reason =
      matchesMarker(row.name) ??
      matchesMarker(row.projectName) ??
      matchesMarker(row.source) ??
      null;
    if (reason) {
      hits.push({
        table: "Lead",
        id: row.id,
        label: row.name,
        reason,
      });
    }
  }

  const audits = await prisma.adminAuditLog.findMany({
    where: {
      OR: [
        { action: { contains: "VERIFY" } },
        { action: { contains: "probe" } },
        { action: { contains: "test" } },
      ],
    },
    select: { id: true, action: true, entityType: true, entityId: true },
    take: 200,
  });
  for (const row of audits) {
    hits.push({
      table: "AdminAuditLog",
      id: row.id,
      label: `${row.action} / ${row.entityType}`,
      reason: "verify/probe/test action",
    });
  }

  console.log(`Found ${hits.length} suspected test-related row(s).`);
  for (const hit of hits) {
    console.log(
      `- [${hit.table}] ${hit.id} · ${hit.label} · marker=${hit.reason}`
    );
  }

  if (!cleanup) {
    console.log(
      "Read-only mode. Re-run with --cleanup to remove confidently marked rows only."
    );
    return;
  }

  // Cleanup order respects FKs; only exact IDs from hits above.
  const byTable = (table: string) =>
    hits.filter(h => h.table === table).map(h => h.id);

  const leadIds = byTable("Lead");
  if (leadIds.length) {
    await prisma.leadEvent.deleteMany({ where: { leadId: { in: leadIds } } });
    await prisma.leadSessionEvent.deleteMany({
      where: { session: { leadId: { in: leadIds } } },
    });
    await prisma.leadSession.deleteMany({
      where: { leadId: { in: leadIds } },
    });
    await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
    console.log(`Cleaned ${leadIds.length} Lead(+events/sessions)`);
  }

  const projectIds = byTable("Project");
  if (projectIds.length) {
    await prisma.projectMedia.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.projectService.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
    console.log(`Cleaned ${projectIds.length} Project(+media/services)`);
  }

  const offerIds = byTable("LimitedOffer");
  if (offerIds.length) {
    await prisma.offerPackage.deleteMany({
      where: { offerId: { in: offerIds } },
    });
    await prisma.limitedOffer.deleteMany({ where: { id: { in: offerIds } } });
    console.log(`Cleaned ${offerIds.length} LimitedOffer(+packages)`);
  }

  const packageIds = byTable("Package");
  if (packageIds.length) {
    await prisma.packageFeature.deleteMany({
      where: { packageId: { in: packageIds } },
    });
    await prisma.package.deleteMany({ where: { id: { in: packageIds } } });
    console.log(`Cleaned ${packageIds.length} Package(+features)`);
  }

  for (const [table, ids] of [
    ["Testimonial", byTable("Testimonial")],
    ["TrustMetric", byTable("TrustMetric")],
    ["ClientLogo", byTable("ClientLogo")],
    ["FAQ", byTable("FAQ")],
  ] as const) {
    if (!ids.length) continue;
    if (table === "Testimonial") {
      await prisma.testimonial.deleteMany({ where: { id: { in: ids } } });
    } else if (table === "TrustMetric") {
      await prisma.trustMetric.deleteMany({ where: { id: { in: ids } } });
    } else if (table === "ClientLogo") {
      await prisma.clientLogo.deleteMany({ where: { id: { in: ids } } });
    } else {
      await prisma.fAQ.deleteMany({ where: { id: { in: ids } } });
    }
    console.log(`Cleaned ${ids.length} ${table}`);
  }

  const auditIds = byTable("AdminAuditLog");
  if (auditIds.length) {
    await prisma.adminAuditLog.deleteMany({ where: { id: { in: auditIds } } });
    console.log(`Cleaned ${auditIds.length} AdminAuditLog`);
  }

  const adminIds = byTable("AdminUser");
  if (adminIds.length) {
    await prisma.adminAuditLog.deleteMany({
      where: { adminUserId: { in: adminIds } },
    });
    await prisma.adminUser.deleteMany({ where: { id: { in: adminIds } } });
    console.log(`Cleaned ${adminIds.length} AdminUser`);
  }

  console.log("Cleanup complete (marker-scoped only).");
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
