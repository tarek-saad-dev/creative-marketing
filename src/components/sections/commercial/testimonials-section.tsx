import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
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
    <CinematicSection
      aria-labelledby="testimonials-heading"
      className="scroll-mt-nav section-space"
      backdropWord="VOICE"
      backdropPosition="start"
    >
      <Container className="space-y-10">
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
              <figure className="card-glow h-full rounded-2xl card-glass p-6 transition-colors hover:border-white/20">
                <blockquote className="body-text">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-4 space-y-1 text-sm">
                  <p className="font-semibold text-foreground">
                    {item.clientName}
                  </p>
                  {item.projectName ? (
                    <p className="body-text-muted">{item.projectName}</p>
                  ) : null}
                  {item.industry ? (
                    <p className="text-xs text-brand-aqua">{item.industry}</p>
                  ) : null}
                  {item.serviceLabel ? (
                    <p className="body-text-muted text-xs">
                      {item.serviceLabel}
                    </p>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </CinematicSection>
  );
}
