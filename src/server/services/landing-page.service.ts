import "server-only";

import { getAllSiteSettings } from "@/server/repositories/site-settings.repository";
import {
  findVerifiedActiveTrustMetrics,
  findActiveClientLogos,
} from "@/server/repositories/trust.repository";
import {
  buildServicesEcosystem,
  getFeaturedWorkWallProjects,
} from "@/server/services/project.service";
import { findActiveServices } from "@/server/repositories/service.repository";
import { findPublishedProjectsForServicePreviews } from "@/server/repositories/project.repository";
import { getCommercialLandingData } from "@/server/services/commercial-landing.service";
import { toPriceNumber } from "@/lib/validation/pricing";
import type { LandingPageData } from "@/lib/validation";
import type { ServiceCategory } from "@/generated/prisma";

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

const SERVICE_CATEGORY_ORDER: ServiceCategory[] = [
  "THINK",
  "CREATE",
  "BUILD",
  "GROW",
];

export async function getLandingPageData(): Promise<LandingPageData> {
  const [
    settings,
    trustMetrics,
    clientLogos,
    featuredProjects,
    services,
    previewProjects,
    commercial,
  ] = await Promise.all([
    getAllSiteSettings(),
    findVerifiedActiveTrustMetrics(),
    findActiveClientLogos(),
    getFeaturedWorkWallProjects(),
    findActiveServices(),
    findPublishedProjectsForServicePreviews(),
    getCommercialLandingData(),
  ]);

  const serviceEcosystem = buildServicesEcosystem(services, previewProjects);

  const serviceGroups = SERVICE_CATEGORY_ORDER.map(category => ({
    category,
    services: services
      .filter(service => service.category === category)
      .map(service => ({
        id: service.id,
        slug: service.slug,
        nameAr: service.nameAr,
        nameEn: service.nameEn,
      })),
  })).filter(group => group.services.length > 0);

  const activeOffer =
    commercial.offer && commercial.offer.computedStatus === "active"
      ? {
          id: commercial.offer.id,
          slug: commercial.offer.slug,
          name: commercial.offer.name,
          headline: commercial.offer.headline,
          description: commercial.offer.description,
          startsAt: new Date(commercial.offer.startsAt),
          endsAt: new Date(commercial.offer.endsAt),
          maxSlots: commercial.offer.maxSlots,
          bookedSlots: commercial.offer.bookedSlots,
          remainingSlots: commercial.offer.remainingSlots,
          computedStatus: "active" as const,
          packages: commercial.offer.packages.map(row => ({
            packageId: row.packageId,
            packageSlug: row.packageSlug,
            packageName: row.packageName,
            offerPrice: row.offerPrice,
            displayOrder: row.displayOrder,
          })),
        }
      : null;

  return {
    settings,
    brand: {
      name: asString(settings["brand.name"], "Creative Marketing"),
      slogan: asString(
        settings["brand.slogan"],
        "WE THINK. WE CREATE. YOU GROW."
      ),
    },
    trustMetrics,
    clientLogos,
    featuredProjects,
    serviceEcosystem,
    services,
    serviceGroups,
    activeOffer,
    offer: commercial.offer,
    packages: commercial.packages.map(pkg => ({
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      tagline: pkg.tagline,
      description: pkg.description,
      idealFor: pkg.idealFor,
      originalPrice: pkg.originalPrice,
      currency: pkg.currency,
      billingPeriod: pkg.billingPeriod,
      startTimeText: pkg.startTimeText,
      revisionCount: pkg.revisionCount,
      isFeatured: pkg.isFeatured,
      displayOrder: pkg.displayOrder,
      offerPrice: pkg.offerPrice,
      savingAmount: pkg.savingAmount,
      savingPercent: pkg.savingPercent,
      features: pkg.features,
    })),
    testimonials: commercial.testimonials,
    faqs: commercial.faqs,
    faqCount: commercial.faqs.length,
    contactReadiness: commercial.contactReadiness,
  };
}

export function summarizeLandingSafety(data: LandingPageData) {
  return {
    brandName: data.brand.name,
    serviceGroupCount: data.serviceGroups.length,
    publicPackageCount: data.packages.length,
    zeroOrMissingPrices: data.packages.filter(
      pkg => (toPriceNumber(pkg.originalPrice) ?? 0) <= 0
    ).length,
    trustMetricCount: data.trustMetrics.length,
    projectCount: data.featuredProjects.length,
    testimonialCount: data.testimonials.length,
    clientLogoCount: data.clientLogos.length,
    faqCount: data.faqCount,
  };
}
