import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { WorkWall } from "@/components/sections/work/work-wall";
import { WorkEmptyState } from "@/components/sections/work/work-empty-state";
import { WorkToServicesBridge } from "@/components/sections/work/work-to-services-bridge";
import type { WorkWallProject } from "@/server/services/project.service";

type WorkSectionProps = {
  projects: WorkWallProject[];
};

export function WorkSection({ projects }: WorkSectionProps) {
  const hasProjects = projects.length > 0;
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <CinematicSection
      id="work"
      aria-labelledby="work-heading"
      className="scroll-mt-nav section-space"
      backdropWord="WORK"
      backdropPosition="end"
    >
      <Container className="space-y-12">
        <Reveal>
          <SectionHeading
            id="work-heading"
            eyebrow="selected work"
            title="نتائج تُشاهد، مش وعود تتقال."
            description={
              hasProjects
                ? "اخترنا مجموعة من الأعمال التي توضّح كيف نحوّل الفكرة إلى حضور بصري متكامل."
                : "نعمل حاليًا على تجهيز دراسات أعمالنا بصورة تليق بالتفاصيل والتنفيذ."
            }
          />
        </Reveal>

        <Reveal delay={0.06}>
          {hasProjects ? (
            <WorkWall projects={projects} />
          ) : (
            <WorkEmptyState isDevelopment={isDevelopment} />
          )}
        </Reveal>

        {hasProjects ? (
          <Reveal delay={0.1}>
            <p className="max-w-2xl text-sm leading-7 text-foreground-muted sm:text-base">
              كل مشروع هنا منشور فعليًا — مع تفاصيل التحدي والحل والوسائط عند
              توفرها. اضغط لاكتشاف الدراسة الكاملة.
            </p>
          </Reveal>
        ) : null}

        <WorkToServicesBridge />
      </Container>
    </CinematicSection>
  );
}
