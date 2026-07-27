import { Container } from "@/components/ui/container";
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
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-nav section-space border-t border-border/30"
    >
      <Container className="max-w-3xl space-y-6 text-center">
        <h2
          id="contact-heading"
          className="font-headline text-display-md text-foreground text-balance"
        >
          مشروعك يستحق يظهر بالشكل اللي يخلي الناس تثق فيه.
        </h2>
        <p className="text-base leading-8 text-foreground-muted">
          احكِ لنا عن مشروعك، وسنقترح عليك الباكدج الأنسب بدون تعقيد.
        </p>
        <p className="text-sm text-foreground-muted">
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
    </section>
  );
}
