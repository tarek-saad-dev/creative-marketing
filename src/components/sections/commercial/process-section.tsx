import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { PROCESS_STEPS } from "@/lib/content/process-steps";
import { ProcessTimeline } from "@/components/sections/commercial/process-timeline";

export function ProcessSection() {
  return (
    <CinematicSection
      id="process"
      aria-labelledby="process-heading"
      className="scroll-mt-nav section-space"
      backdropWord="PROCESS"
      backdropPosition="end"
    >
      <Container className="space-y-12">
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
    </CinematicSection>
  );
}
