import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { ContentStatus, PrismaClient } from "../src/generated/prisma";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

function validateEnv(): { databaseUrl: string } {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (!databaseUrl || !directUrl) {
    console.error(
      "Missing required environment variables: DATABASE_URL and DIRECT_URL."
    );
    console.error(
      "Copy .env.example to .env.local and fill in Neon credentials."
    );
    process.exit(1);
  }

  if (
    (!databaseUrl.startsWith("postgresql://") &&
      !databaseUrl.startsWith("postgres://")) ||
    (!directUrl.startsWith("postgresql://") &&
      !directUrl.startsWith("postgres://"))
  ) {
    console.error(
      "DATABASE_URL and DIRECT_URL must be PostgreSQL connection strings."
    );
    process.exit(1);
  }

  if (
    !/sslmode=require/i.test(databaseUrl) ||
    !/sslmode=require/i.test(directUrl)
  ) {
    console.error("DATABASE_URL and DIRECT_URL must include sslmode=require.");
    process.exit(1);
  }

  return { databaseUrl };
}

async function main() {
  const { databaseUrl } = validateEnv();

  const adapter = new PrismaNeon({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$queryRaw`SELECT 1`;

    const brandName = await prisma.siteSetting.findUnique({
      where: { key: "brand.name" },
      select: { key: true },
    });

    if (!brandName) {
      console.error(
        "Connected, but brand.name site setting was not found. Run: npm run db:seed"
      );
      process.exit(1);
    }

    const [
      serviceCount,
      packageDraftCount,
      packagePublishedCount,
      faqCount,
      trustInactiveCount,
    ] = await Promise.all([
      prisma.service.count({ where: { deletedAt: null, isActive: true } }),
      prisma.package.count({
        where: { deletedAt: null, status: ContentStatus.DRAFT },
      }),
      prisma.package.count({
        where: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
          originalPrice: { not: null, gt: 0 },
        },
      }),
      prisma.fAQ.count({ where: { isActive: true } }),
      prisma.trustMetric.count({
        where: { OR: [{ isActive: false }, { isVerified: false }] },
      }),
    ]);

    console.log("Database check passed.");
    console.log("- Prisma connectivity: ok");
    console.log("- Site settings (brand.name): present");
    console.log(`- Active services: ${serviceCount}`);
    console.log(`- Draft packages: ${packageDraftCount}`);
    console.log(`- Public priced packages: ${packagePublishedCount}`);
    console.log(`- Active FAQs: ${faqCount}`);
    console.log(
      `- Inactive/unverified trust placeholders: ${trustInactiveCount}`
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    const safeMessage = message
      .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
      .replace(/postgres:\/\/[^\s"']+/gi, "postgres://***")
      .replace(/:[^:@/\s]+@/g, ":***@");
    console.error("Database check failed:", safeMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
