import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
import { BrandButton } from "@/components/ui/brand-button";
import { LeadOpenButton } from "@/components/lead/lead-open-button";
import { DistributedProof } from "@/components/sections/commercial/distributed-proof";
import type { PublicTestimonial } from "@/server/services/commercial-landing.service";

type FinalConversionSectionProps = {
  testimonial?: PublicTestimonial | null;
  responseHours?: string | null;
};

export function FinalConversionSection({
  testimonial,
  responseHours,
}: FinalConversionSectionProps) {
  return (
    <CinematicSection
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-nav section-space"
      backdropWord="START"
      backdropPosition="center"
    >
      <Container className="relative z-10 max-w-3xl space-y-8 text-center">
        <p className="font-heading-en text-xs tracking-[0.18em] text-primary uppercase">
          Ready
        </p>
        <h2
          id="contact-heading"
          className="font-headline text-display-xl text-foreground text-balance text-editorial"
        >
          مشروعك يستحق يظهر بالشكل اللي يخلي الناس تثق فيه.
        </h2>
        <p className="body-text mx-auto max-w-xl">
          احكِ لنا عن مشروعك، وسنقترح عليك الباكدج الأنسب بدون تعقيد.
        </p>
        <p className="body-text-muted">
          تواصل مباشر · خطوات واضحة · بدون رسائل مزعجة
          {responseHours ? ` · ${responseHours}` : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <LeadOpenButton source="final_cta" variant="primary" size="lg">
            ابدأ مشروعك
          </LeadOpenButton>
          <BrandButton href="#packages" variant="secondary" size="lg">
            راجع الباكدجات
          </BrandButton>
        </div>
        {testimonial ? (
          <DistributedProof testimonial={testimonial} slot="final_cta" />
        ) : null}
      </Container>
    </CinematicSection>
  );
}
