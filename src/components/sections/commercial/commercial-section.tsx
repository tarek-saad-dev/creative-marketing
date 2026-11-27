import { LimitedOfferSection } from "@/components/sections/commercial/limited-offer-section";
import { PricingSection } from "@/components/sections/commercial/pricing-section";
import { ProcessSection } from "@/components/sections/commercial/process-section";
import { TestimonialsSection } from "@/components/sections/commercial/testimonials-section";
import { FaqSection } from "@/components/sections/commercial/faq-section";
import { FinalConversionSection } from "@/components/sections/commercial/final-conversion-section";
import type {HomeLayout} from "@/lib/content/homepage-editor";
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

export function CommercialSectionPart({data,part,copy,processSteps}:{processSteps?:HomeLayout["processSteps"];data:CommercialSectionProps["data"];part:"offer"|"packages"|"process"|"testimonials"|"faq"|"contact";copy?:HomeLayout["copy"]}) {
  const testimonials = data.testimonials;
  const pricingProof = testimonials[0] ?? null;
  const finalProof =
    testimonials.find(item => item.id !== pricingProof?.id) ?? null;
  const responseHours = asString(data.settings["brand.responseHours"]);

  switch(part){
    case "offer":return <LimitedOfferSection offer={data.offer} packages={data.packages}/>;
    case "packages":return <PricingSection packages={data.packages} featuredTestimonial={pricingProof} hasActiveOffer={data.offer?.computedStatus==="active"} title={copy?.packagesTitle||undefined}/>;
    case "process":return <ProcessSection title={copy?.processTitle||undefined} description={copy?.processDescription||undefined} steps={processSteps}/>;
    case "testimonials":return <TestimonialsSection testimonials={testimonials} title={copy?.testimonialsTitle||undefined}/>;
    case "faq":return <FaqSection faqs={data.faqs} title={copy?.faqTitle||undefined}/>;
    case "contact":return <FinalConversionSection testimonial={finalProof} responseHours={responseHours||null} title={copy?.contactTitle||undefined} description={copy?.contactDescription||undefined}/>;
  }
}
export function CommercialSection({data}:CommercialSectionProps){return <>{(["offer","packages","process","testimonials","faq","contact"] as const).map(part=><CommercialSectionPart key={part} data={data} part={part}/>)}</>;}
