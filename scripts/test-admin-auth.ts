/**
 * Auth smoke tests against AdminUser + bcrypt (no browser).
 * Does not print credentials.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db/client";
import { hashPassword, verifyPassword } from "../src/server/auth/password";

async function main() {
  const email = `auth-test-${Date.now()}@example.invalid`;
  const password = "AuthTest!Pass123";
  const wrong = "WrongPass!99999";

  const admin = await prisma.adminUser.create({
    data: {
      name: "Auth Test",
      email,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
    },
  });

  try {
    if (!(await verifyPassword(password, admin.passwordHash))) {
      throw new Error("Correct password failed");
    }
    console.log("OK  correct password");

    if (await verifyPassword(wrong, admin.passwordHash)) {
      throw new Error("Wrong password accepted");
    }
    console.log("OK  wrong password rejected");

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { isActive: false },
    });
    const disabled = await prisma.adminUser.findUnique({
      where: { id: admin.id },
    });
    if (disabled?.isActive) {
      throw new Error("Disable failed");
    }
    console.log("OK  disabled admin flagged inactive");

    console.log("admin:test-auth passed");
  } finally {
    await prisma.adminUser.delete({ where: { id: admin.id } });
  }
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
