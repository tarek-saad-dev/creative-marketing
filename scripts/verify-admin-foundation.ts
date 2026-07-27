/**
 * Verify admin foundation tables, audit write, and public content unchanged.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db/client";
import { hashPassword } from "../src/server/auth/password";

async function main() {
  const checks: string[] = [];

  const adminTable = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(
    `SELECT COUNT(*)::bigint AS n FROM "AdminUser"`
  );
  checks.push(`AdminUser reachable (count=${Number(adminTable[0]?.n ?? 0)})`);

  const auditTable = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(
    `SELECT COUNT(*)::bigint AS n FROM "AdminAuditLog"`
  );
  checks.push(
    `AdminAuditLog reachable (count=${Number(auditTable[0]?.n ?? 0)})`
  );

  const email = `verify-admin-${Date.now()}@example.invalid`;
  const created = await prisma.adminUser.create({
    data: {
      name: "Verify Admin",
      email,
      passwordHash: await hashPassword("VerifyPass!23456"),
      role: "OWNER",
    },
  });
  checks.push(`Created temporary admin ${created.id}`);

  await prisma.adminAuditLog.create({
    data: {
      adminUserId: created.id,
      action: "VERIFY_FOUNDATION",
      entityType: "AdminUser",
      entityId: created.id,
      metadata: { probe: true },
    },
  });
  checks.push("Audit log write ok");

  const publishedBefore = await prisma.project.count({
    where: { status: "PUBLISHED", deletedAt: null },
  });

  await prisma.adminAuditLog.deleteMany({
    where: { adminUserId: created.id },
  });
  await prisma.adminUser.delete({ where: { id: created.id } });
  checks.push("Cleaned temporary admin");

  const publishedAfter = await prisma.project.count({
    where: { status: "PUBLISHED", deletedAt: null },
  });
  if (publishedBefore !== publishedAfter) {
    throw new Error("Public project count changed unexpectedly");
  }
  checks.push(`Public published projects unchanged (${publishedAfter})`);

  for (const line of checks) {
    console.log(`OK  ${line}`);
  }
  console.log("admin:verify passed");
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
