import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { PROCESS_STEPS } from "@/lib/content/process-steps";
import { ProcessTimeline } from "@/components/sections/commercial/process-timeline";

export function ProcessSection() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="scroll-mt-nav section-space border-t border-border/30"
    >
      <Container className="space-y-10">
        <Reveal>
          <SectionHeading
            id="process-heading"
            eyebrow="process"
            title="من أول رسالة… كل خطوة واضحة."
            description="مسار عمل منظم من الفهم إلى النشر والتطوير حسب نطاق الباكدج."
          />
        </Reveal>
        <ProcessTimeline steps={PROCESS_STEPS} />
      </Container>
    </section>
  );
}
