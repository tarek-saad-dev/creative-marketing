import "server-only";

import { findPublishedPackages } from "@/server/repositories/package.repository";
import { findCandidateActiveOffers } from "@/server/repositories/offer.repository";
import { findPublishedTestimonials } from "@/server/repositories/testimonial.repository";
import { findActiveFaqs } from "@/server/repositories/faq.repository";
import { getAllSiteSettings } from "@/server/repositories/site-settings.repository";
import {
  getRemainingSlots,
  pickCurrentPublicOffer,
  type ComputedOfferStatus,
} from "@/lib/offers/offer-status";
import {
  calculateSavingAmount,
  calculateSavingPercent,
  decimalToPublicString,
} from "@/lib/validation/decimal-price";
import {
  hasValidConfiguredPrice,
  isValidPublicOfferPrice,
} from "@/lib/validation/pricing";

export type PublicPackageFeature = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  included: boolean;
  displayOrder: number;
};

export type PublicPackageCard = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  idealFor: string;
  originalPrice: string;
  currency: string;
  billingPeriod: string | null;
  startTimeText: string | null;
  revisionCount: number | null;
  isFeatured: boolean;
  displayOrder: number;
  features: PublicPackageFeature[];
  offerPrice: string | null;
  savingAmount: string | null;
  savingPercent: number | null;
};

export type PublicOfferView = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  maxSlots: number | null;
  bookedSlots: number;
  remainingSlots: number | null;
  computedStatus: ComputedOfferStatus;
  packages: Array<{
    packageId: string;
    packageSlug: string;
    packageName: string;
    originalPrice: string;
    offerPrice: string;
    savingAmount: string | null;
    savingPercent: number | null;
    displayOrder: number;
  }>;
};

export type PublicTestimonial = {
  id: string;
  clientName: string;
  projectName: string | null;
  industry: string | null;
  quote: string;
  clientImageUrl: string | null;
  clientLogoUrl: string | null;
  screenshotUrl: string | null;
  serviceLabel: string | null;
  displayOrder: number;
};

export type PublicFaq = {
  id: string;
  slug: string;
  question: string;
  answer: string;
  category: string | null;
  displayOrder: number;
};

export type ContactReadiness = {
  hasWhatsApp: boolean;
  hasEmail: boolean;
  whatsappDigits: string | null;
};

export type CommercialLandingData = {
  offer: PublicOfferView | null;
  packages: PublicPackageCard[];
  testimonials: PublicTestimonial[];
  faqs: PublicFaq[];
  contactReadiness: ContactReadiness;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export async function getCommercialLandingData(
  now: Date = new Date()
): Promise<CommercialLandingData> {
  const [packagesRaw, offerCandidates, testimonialsRaw, faqs, settings] =
    await Promise.all([
      findPublishedPackages(),
      findCandidateActiveOffers(now),
      findPublishedTestimonials(now),
      findActiveFaqs(),
      getAllSiteSettings(),
    ]);

  const publicPackagesBase = packagesRaw
    .map(pkg => {
      const originalPrice = decimalToPublicString(pkg.originalPrice);
      if (!originalPrice || !pkg.idealFor) return null;
      if (!hasValidConfiguredPrice(originalPrice)) return null;
      if (pkg.features.length < 1) return null;

      return {
        id: pkg.id,
        slug: pkg.slug,
        name: pkg.name,
        tagline: pkg.tagline,
        description: pkg.description,
        idealFor: pkg.idealFor,
        originalPrice,
        currency: pkg.currency,
        billingPeriod: pkg.billingPeriod,
        startTimeText: pkg.startTimeText,
        revisionCount: pkg.revisionCount,
        isFeatured: pkg.isFeatured,
        displayOrder: pkg.displayOrder,
        features: pkg.features,
      };
    })
    .filter((pkg): pkg is NonNullable<typeof pkg> => pkg !== null);

  const packageById = new Map(publicPackagesBase.map(pkg => [pkg.id, pkg]));

  const scoredOffers = offerCandidates.map(offer => {
    const eligibleRows = offer.offerPackages
      .map(row => {
        const pkg = packageById.get(row.package.id);
        if (!pkg) return null;
        if (
          row.package.deletedAt ||
          row.package.status !== "PUBLISHED" ||
          !hasValidConfiguredPrice(row.package.originalPrice)
        ) {
          return null;
        }
        if (!isValidPublicOfferPrice(row.offerPrice, pkg.originalPrice)) {
          return null;
        }
        const offerPrice = decimalToPublicString(row.offerPrice);
        if (!offerPrice) return null;
        return {
          packageId: pkg.id,
          packageSlug: pkg.slug,
          packageName: pkg.name,
          originalPrice: pkg.originalPrice,
          offerPrice,
          savingAmount: calculateSavingAmount(pkg.originalPrice, offerPrice),
          savingPercent: calculateSavingPercent(pkg.originalPrice, offerPrice),
          displayOrder: row.displayOrder,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    return {
      ...offer,
      eligiblePackageCount: eligibleRows.length,
      eligibleRows,
    };
  });

  const picked = pickCurrentPublicOffer(scoredOffers, now);

  let offer: PublicOfferView | null = null;
  if (
    picked &&
    (picked.computedStatus === "active" ||
      picked.computedStatus === "upcoming" ||
      picked.computedStatus === "full")
  ) {
    offer = {
      id: picked.id,
      slug: picked.slug,
      name: picked.name,
      headline: picked.headline,
      description: picked.description,
      startsAt: picked.startsAt.toISOString(),
      endsAt: picked.endsAt.toISOString(),
      maxSlots: picked.maxSlots,
      bookedSlots: picked.bookedSlots,
      remainingSlots: getRemainingSlots(picked.maxSlots, picked.bookedSlots),
      computedStatus: picked.computedStatus,
      packages: picked.eligibleRows,
    };
  }

  const offerPriceByPackageId = new Map(
    offer?.computedStatus === "active"
      ? offer.packages.map(row => [row.packageId, row] as const)
      : []
  );

  const packages: PublicPackageCard[] = publicPackagesBase.map(pkg => {
    const offerRow = offerPriceByPackageId.get(pkg.id) ?? null;
    return {
      ...pkg,
      offerPrice: offerRow?.offerPrice ?? null,
      savingAmount: offerRow?.savingAmount ?? null,
      savingPercent: offerRow?.savingPercent ?? null,
    };
  });

  const whatsappRaw = asString(settings["brand.whatsapp"]).trim();
  const whatsappDigits = digitsOnly(whatsappRaw);
  const email = asString(settings["brand.email"]).trim();

  return {
    offer,
    packages,
    testimonials: testimonialsRaw.map(item => ({
      id: item.id,
      clientName: item.clientName,
      projectName: item.projectName,
      industry: item.industry,
      quote: item.quote,
      clientImageUrl: item.clientImageUrl,
      clientLogoUrl: item.clientLogoUrl,
      screenshotUrl: item.screenshotUrl,
      serviceLabel: item.serviceLabel,
      displayOrder: item.displayOrder,
    })),
    faqs: faqs.map(faq => ({
      id: faq.id,
      slug: faq.slug,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
    })),
    contactReadiness: {
      hasWhatsApp: whatsappDigits.length >= 8,
      hasEmail: email.length > 0,
      whatsappDigits: whatsappDigits.length >= 8 ? whatsappDigits : null,
    },
  };
}
