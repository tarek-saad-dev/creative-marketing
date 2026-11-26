import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { BrandButton } from "@/components/ui/brand-button";
import { canUseNextImage } from "@/lib/media/public-media";
import type { ProjectDetail } from "@/server/services/project.service";

type CaseStudyHeroProps = {
  project: ProjectDetail;
};

export function CaseStudyHero({ project }: CaseStudyHeroProps) {
  return (
    <header className="relative overflow-hidden border-b border-border/30 bg-gradient-to-br from-[#39247f] via-[#282067] to-[#18526e]">
      <Container className="relative space-y-6 pb-12 pt-[calc(var(--nav-height)+2rem)] sm:pb-16 sm:pt-[calc(var(--nav-height)+3rem)]">
        <Link
          href="/#work"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← العودة إلى الأعمال
        </Link>

        <div className="max-w-3xl space-y-4">
          {project.industry ? (
            <p className="text-sm font-medium tracking-wide text-brand-aqua">
              {project.industry}
            </p>
          ) : null}
          <h1 className="font-headline text-display-md text-foreground text-balance">
            {project.title}
          </h1>
          <p className="text-base leading-8 text-foreground-muted sm:text-lg">
            {project.summary}
          </p>

          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground-muted">
            {project.clientName ? (
              <div>
                <dt className="inline text-foreground-muted">العميل: </dt>
                <dd className="inline text-foreground">{project.clientName}</dd>
              </div>
            ) : null}
            {project.duration ? (
              <div>
                <dt className="inline text-foreground-muted">المدة: </dt>
                <dd className="inline text-foreground">{project.duration}</dd>
              </div>
            ) : null}
          </dl>

          {project.services.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="الخدمات المقدمة">
              {project.services.map(service => (
                <li
                  key={service.id}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-foreground"
                >
                  {service.nameAr}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="relative aspect-[16/10] mx-auto max-w-6xl overflow-hidden bg-[#1a245a]/50 rounded-2xl border border-border/40 shadow-floating">
          {canUseNextImage(project.coverImageUrl) ? (
            <Image
              src={project.coverImageUrl}
              alt={project.coverImageAlt}
              fill
              priority
              className="object-contain"
              sizes="(max-width:1024px) 100vw, 960px"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImageUrl}
              alt={project.coverImageAlt}
              className="h-full w-full object-contain"
            />
          )}
        </div>

        <BrandButton
          href="#case-body"
          variant="secondary"
          className="sm:w-auto"
        >
          استكشف التفاصيل
        </BrandButton>
      </Container>
    </header>
  );
}
