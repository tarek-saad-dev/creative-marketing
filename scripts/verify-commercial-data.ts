/**
 * Read-only commercial readiness report against Neon.
 * Never prints private contact values.
 */
import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { ContentStatus, PrismaClient } from "../src/generated/prisma";
import { configureNeonWebSocket } from "../src/lib/db/neon-ws";
import {
  computeOfferStatus,
  resolvePublicOfferStatus,
} from "../src/lib/offers/offer-status";
import {
  hasValidConfiguredPrice,
  isValidPublicOfferPrice,
} from "../src/lib/validation/pricing";

config({ path: ".env.local" });
config();
configureNeonWebSocket();

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  });
}

async function main() {
  const prisma = createClient();
  const now = new Date();

  try {
    const [packages, offers, testimonials, faqs, whatsappSetting] =
      await Promise.all([
        prisma.package.findMany({
          where: { deletedAt: null },
          select: {
            name: true,
            status: true,
            originalPrice: true,
            idealFor: true,
            features: { select: { id: true } },
          },
        }),
        prisma.limitedOffer.findMany({
          include: {
            offerPackages: {
              include: {
                package: {
                  select: {
                    status: true,
                    deletedAt: true,
                    originalPrice: true,
                  },
                },
              },
            },
          },
        }),
        prisma.testimonial.count({
          where: {
            deletedAt: null,
            status: ContentStatus.PUBLISHED,
            publishedAt: { not: null, lte: now },
          },
        }),
        prisma.fAQ.count({ where: { isActive: true } }),
        prisma.siteSetting.findUnique({
          where: { key: "brand.whatsapp" },
          select: { value: true },
        }),
      ]);

    const draft = packages.filter(pkg => pkg.status === ContentStatus.DRAFT);
    const published = packages.filter(
      pkg => pkg.status === ContentStatus.PUBLISHED
    );
    const publicReady = published.filter(
      pkg =>
        hasValidConfiguredPrice(pkg.originalPrice) &&
        Boolean(pkg.idealFor?.trim()) &&
        pkg.features.length > 0
    );
    const invalidPrice = published.filter(
      pkg => !hasValidConfiguredPrice(pkg.originalPrice)
    );

    let active = 0;
    let upcoming = 0;
    let invalidRelations = 0;

    for (const offer of offers) {
      const eligible = offer.offerPackages.filter(row => {
        if (row.package.deletedAt) return false;
        if (row.package.status !== ContentStatus.PUBLISHED) return false;
        return isValidPublicOfferPrice(
          row.offerPrice,
          row.package.originalPrice
        );
      }).length;
      const status = resolvePublicOfferStatus(offer, eligible, now);
      if (status === "active") active += 1;
      if (status === "upcoming") upcoming += 1;
      if (status === "invalid") invalidRelations += 1;
      void computeOfferStatus(offer, now);
    }

    const whatsappConfigured =
      typeof whatsappSetting?.value === "string" &&
      whatsappSetting.value.replace(/\D/g, "").length >= 8;

    console.log("Commercial data verification:");
    console.log(`- Public-ready packages: ${publicReady.length}`);
    console.log(`- Draft packages: ${draft.length}`);
    console.log(
      `- Published with invalid/missing price: ${invalidPrice.length}`
    );
    console.log(`- Active offers (eligible): ${active}`);
    console.log(`- Upcoming offers (eligible): ${upcoming}`);
    console.log(`- Invalid offer relationships: ${invalidRelations}`);
    console.log(`- Published testimonials: ${testimonials}`);
    console.log(`- Active FAQs: ${faqs}`);
    console.log(`- WhatsApp configured: ${whatsappConfigured ? "yes" : "no"}`);
    console.log("Commercial verification complete.");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown commercial verify error";
    console.error(
      "Commercial verification failed:",
      message
        .replace(/postgresql:\/\/[^\s"']+/gi, "postgresql://***")
        .replace(/:[^:@/\s]+@/g, ":***@")
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
