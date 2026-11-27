import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { WorkWall } from "@/components/sections/work/work-wall";
import { WorkEmptyState } from "@/components/sections/work/work-empty-state";
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
    >
      <Container width="wide" className="space-y-8">
        <Reveal>
          <SectionHeading
            id="work-heading"
            eyebrow="selected work"
            title="مختارات من أعمالنا."
            description={
              hasProjects
                ? "اكتشف المشاريع وتفاصيلها."
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
        {hasProjects && <Link href="/work" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-aqua underline underline-offset-4">شوف كل المشاريع ←</Link>}
      </Container>
    </CinematicSection>
  );
}
