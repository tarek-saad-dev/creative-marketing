import Link from "next/link";
import Image from "next/image";
import { canUseNextImage } from "@/lib/media/public-media";
import type { RelatedProjectCard } from "@/server/services/project.service";

type RelatedProjectsProps = {
  projects: RelatedProjectCard[];
};

export function RelatedProjects({ projects }: RelatedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="space-y-5">
      <h2
        id="related-heading"
        className="font-headline text-2xl font-semibold text-foreground"
      >
        مشاريع ذات صلة
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <li key={project.id}>
            <Link
              href={`/work/${project.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border/40 bg-surface-glass shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative aspect-[4/3]">
                {canUseNextImage(project.coverImageUrl) ? (
                  <Image
                    src={project.coverImageUrl}
                    alt={project.coverImageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.coverImageUrl}
                    alt={project.coverImageAlt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="space-y-1 p-4">
                {project.industry ? (
                  <p className="text-xs text-brand-aqua">{project.industry}</p>
                ) : null}
                <p className="font-headline text-base font-semibold text-foreground">
                  {project.title}
                </p>
                <p className="line-clamp-2 text-sm text-foreground-muted">
                  {project.summary}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
