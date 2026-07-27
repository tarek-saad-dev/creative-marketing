import { Container } from "@/components/ui/container";
import { BrandButton } from "@/components/ui/brand-button";
import { CaseStudyHero } from "@/components/sections/case-study/case-study-hero";
import { CaseStudyGallery } from "@/components/sections/case-study/case-study-gallery";
import { RelatedProjects } from "@/components/sections/case-study/related-projects";
import type {
  ProjectDetail,
  RelatedProjectCard,
} from "@/server/services/project.service";

type CaseStudyViewProps = {
  project: ProjectDetail;
  related: RelatedProjectCard[];
};

export function CaseStudyView({ project, related }: CaseStudyViewProps) {
  return (
    <>
      <CaseStudyHero project={project} />

      <Container id="case-body" className="space-y-12 py-14 sm:py-16">
        {project.challenge ? (
          <section
            aria-labelledby="challenge-heading"
            className="max-w-3xl space-y-3"
          >
            <h2
              id="challenge-heading"
              className="font-headline text-2xl font-semibold text-foreground"
            >
              التحدي
            </h2>
            <p className="text-base leading-8 text-foreground-muted whitespace-pre-line">
              {project.challenge}
            </p>
          </section>
        ) : null}

        {project.solution ? (
          <section
            aria-labelledby="solution-heading"
            className="max-w-3xl space-y-3"
          >
            <h2
              id="solution-heading"
              className="font-headline text-2xl font-semibold text-foreground"
            >
              الحل الذي بنيناه
            </h2>
            <p className="text-base leading-8 text-foreground-muted whitespace-pre-line">
              {project.solution}
            </p>
          </section>
        ) : null}

        <CaseStudyGallery items={project.media} />

        {project.resultText ? (
          <section
            aria-labelledby="result-heading"
            className="max-w-3xl space-y-3 rounded-2xl border border-border/40 bg-surface-glass p-6 sm:p-8"
          >
            <h2
              id="result-heading"
              className="font-headline text-2xl font-semibold text-foreground"
            >
              النتيجة
            </h2>
            <p className="text-base leading-8 text-foreground whitespace-pre-line">
              {project.resultText}
            </p>
          </section>
        ) : null}

        <RelatedProjects projects={related} />

        <section
          aria-labelledby="case-cta-heading"
          className="rounded-2xl border border-border/40 bg-background-elevated/60 px-6 py-8 text-center sm:px-10"
        >
          <h2
            id="case-cta-heading"
            className="font-headline text-xl font-semibold text-foreground sm:text-2xl"
          >
            جاهز تبني حضور مشابه لمشروعك؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-foreground-muted">
            نموذج التواصل الكامل سيُضاف لاحقًا. يمكنك العودة لقسم التواصل على
            الصفحة الرئيسية.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <BrandButton href="/#contact">ابدأ مشروعك</BrandButton>
            <BrandButton href="/#work" variant="secondary">
              المزيد من الأعمال
            </BrandButton>
          </div>
        </section>
      </Container>
    </>
  );
}
