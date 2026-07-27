/**
 * Development-only verification of landing public-data safety against Neon.
 * Mirrors getLandingPageData() filters without importing server-only modules.
 */
import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { ContentStatus, PrismaClient } from "../src/generated/prisma";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  });
}

async function main() {
  const prisma = createClient();

  try {
    const [
      brand,
      services,
      publicPackages,
      draftPackages,
      trustPublic,
      projects,
      testimonials,
      logos,
      faqs,
    ] = await Promise.all([
      prisma.siteSetting.findUnique({
        where: { key: "brand.name" },
        select: { value: true },
      }),
      prisma.service.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { displayOrder: "asc" },
        select: { category: true, nameAr: true, displayOrder: true },
      }),
      prisma.package.findMany({
        where: {
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
          originalPrice: { not: null, gt: 0 },
        },
        select: { name: true, originalPrice: true },
      }),
      prisma.package.findMany({
        where: { deletedAt: null, status: ContentStatus.DRAFT },
        orderBy: { displayOrder: "asc" },
        select: { name: true, originalPrice: true },
      }),
      prisma.trustMetric.count({
        where: { isActive: true, isVerified: true },
      }),
      prisma.project.count({
        where: {
          deletedAt: null,
          featured: true,
          status: ContentStatus.PUBLISHED,
        },
      }),
      prisma.testimonial.count({
        where: { deletedAt: null, status: ContentStatus.PUBLISHED },
      }),
      prisma.clientLogo.count({ where: { isActive: true } }),
      prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: { question: true, displayOrder: true },
      }),
    ]);

    const failures: string[] = [];
    const brandName =
      typeof brand?.value === "string" ? brand.value : "Creative Marketing";

    if (!brand) failures.push("brand.name missing");
    if (services.length < 1) failures.push("no active services");
    if (faqs.length < 1) failures.push("no FAQs");
    if (draftPackages.length < 1) failures.push("expected draft packages");
    if (trustPublic > 0)
      failures.push("verified trust metrics unexpectedly public");
    // Featured projects may be 0 (empty Work Wall) or real published work — both valid.
    if (testimonials > 0) failures.push("unexpected published testimonials");
    if (logos > 0) failures.push("unexpected active client logos");

    for (const pkg of publicPackages) {
      const price = Number(pkg.originalPrice?.toString() ?? "0");
      if (!(price > 0)) {
        failures.push(`public package ${pkg.name} has invalid price`);
      }
    }

    const categories = [...new Set(services.map(service => service.category))];

    console.log("Landing data verification:");
    console.log(`- Brand: ${brandName}`);
    console.log(`- Active services: ${services.length}`);
    console.log(`- Service categories: ${categories.join(", ")}`);
    console.log(`- Public priced packages: ${publicPackages.length}`);
    console.log(`- Draft packages: ${draftPackages.length}`);
    console.log(
      `- Draft names: ${draftPackages.map(pkg => pkg.name).join(", ")}`
    );
    console.log(`- Public trust metrics: ${trustPublic}`);
    console.log(`- Featured projects: ${projects}`);
    console.log(`- Testimonials: ${testimonials}`);
    console.log(`- Client logos: ${logos}`);
    console.log(`- FAQs: ${faqs.length}`);

    if (failures.length > 0) {
      console.error("Landing verification failed:");
      for (const failure of failures) console.error(`- ${failure}`);
      process.exit(1);
    }

    console.log("Landing verification passed.");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown landing verify error";
    const safeMessage = message
      .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
      .replace(/postgres:\/\/[^\s"']+/gi, "postgres://***")
      .replace(/:[^:@/\s]+@/g, ":***@");
    console.error("Landing verification failed:", safeMessage);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
