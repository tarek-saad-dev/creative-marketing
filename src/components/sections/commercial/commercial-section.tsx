import { LimitedOfferSection } from "@/components/sections/commercial/limited-offer-section";
import { PricingSection } from "@/components/sections/commercial/pricing-section";
import { ProcessSection } from "@/components/sections/commercial/process-section";
import { TestimonialsSection } from "@/components/sections/commercial/testimonials-section";
import { FaqSection } from "@/components/sections/commercial/faq-section";
import { FinalConversionSection } from "@/components/sections/commercial/final-conversion-section";
import type { LandingPageData } from "@/lib/validation";

type CommercialSectionProps = {
  data: Pick<
    LandingPageData,
    "offer" | "packages" | "testimonials" | "faqs" | "settings"
  >;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function CommercialSection({ data }: CommercialSectionProps) {
  const testimonials = data.testimonials;
  const pricingProof = testimonials[0] ?? null;
  const finalProof =
    testimonials.find(item => item.id !== pricingProof?.id) ?? null;
  const responseHours = asString(data.settings["brand.responseHours"]);

  return (
    <>
      <LimitedOfferSection offer={data.offer} />
      <PricingSection
        packages={data.packages}
        featuredTestimonial={pricingProof}
        hasActiveOffer={data.offer?.computedStatus === "active"}
      />
      <ProcessSection />
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection faqs={data.faqs} />
      <FinalConversionSection
        testimonial={finalProof}
        responseHours={responseHours || null}
      />
    </>
  );
}
