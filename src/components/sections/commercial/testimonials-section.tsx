import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import type { PublicTestimonial } from "@/server/services/commercial-landing.service";

type TestimonialsSectionProps = {
  testimonials: PublicTestimonial[];
};

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    if (process.env.NODE_ENV === "development") {
      return (
        <section className="section-space border-t border-border/20">
          <Container>
            <p className="text-xs text-foreground-muted">
              Dev: لا توجد شهادات منشورة للعرض.
            </p>
          </Container>
        </section>
      );
    }
    return null;
  }

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="scroll-mt-nav section-space border-t border-border/30"
    >
      <Container className="space-y-8">
        <Reveal>
          <SectionHeading
            id="testimonials-heading"
            eyebrow="social proof"
            title="الثقة تبدأ من تجربة واضحة."
          />
        </Reveal>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map(item => (
            <li key={item.id}>
              <figure className="h-full rounded-2xl border border-border/40 bg-surface-glass p-6 shadow-card">
                <blockquote className="text-sm leading-7 text-foreground">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-4 space-y-1 text-sm">
                  <p className="font-semibold text-foreground">
                    {item.clientName}
                  </p>
                  {item.projectName ? (
                    <p className="text-foreground-muted">{item.projectName}</p>
                  ) : null}
                  {item.industry ? (
                    <p className="text-xs text-brand-aqua">{item.industry}</p>
                  ) : null}
                  {item.serviceLabel ? (
                    <p className="text-xs text-foreground-muted">
                      {item.serviceLabel}
                    </p>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
