import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProjectMediaPreview } from "@/components/sections/work/project-media-preview";
import { resolvePreviewSrc } from "@/lib/media/public-media";
import type { WorkLayoutRole } from "@/components/sections/work/work-layout";
import { workRoleClassName } from "@/components/sections/work/work-layout";
import type { WorkWallProject } from "@/server/services/project.service";

type ProjectCardProps = {
  project: WorkWallProject;
  role: WorkLayoutRole;
  priority?: boolean;
};

export function ProjectCard({
  project,
  role,
  priority = false,
}: ProjectCardProps) {
  const preview = resolvePreviewSrc({
    coverImageUrl: project.coverImageUrl,
    primaryMediaType: project.primaryMediaType,
  });

  const serviceLabels = project.services.slice(0, 3).map(s => s.nameAr);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/40 bg-surface-glass shadow-card",
        workRoleClassName(role)
      )}
    >
      <Link
        href={`/work/${project.slug}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-label={`اكتشف المشروع: ${project.title}`}
      >
        <span className="sr-only">اكتشف المشروع</span>
      </Link>

      <div className="absolute inset-0 overflow-hidden">
        <div className="h-full w-full scale-100 transition-transform duration-500 ease-standard group-hover:scale-[1.04] group-focus-within:scale-[1.04] motion-reduce:transform-none">
          <ProjectMediaPreview
            kind={preview.kind}
            src={preview.src}
            poster={preview.poster}
            alt={project.coverImageAlt}
            priority={priority}
            sizes={
              role === "LEAD"
                ? "(max-width: 768px) 100vw, 66vw"
                : role === "WIDE"
                  ? "(max-width: 768px) 100vw, 66vw"
                  : "(max-width: 768px) 100vw, 33vw"
            }
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#1A245A]/95 via-[#1A245A]/45 to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-[1] flex h-full flex-col justify-end p-5 sm:p-6">
        <div className="space-y-2">
          {project.industry ? (
            <p className="text-xs font-medium tracking-wide text-brand-aqua">
              {project.industry}
            </p>
          ) : null}
          <h3 className="font-headline text-xl font-semibold text-foreground text-balance sm:text-2xl">
            {project.title}
          </h3>
          {project.clientName ? (
            <p className="text-sm text-foreground-muted">
              {project.clientName}
            </p>
          ) : null}

          <div className="space-y-2 opacity-100 transition-opacity md:opacity-90 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            {serviceLabels.length > 0 ? (
              <ul
                className="flex flex-wrap gap-2"
                aria-label="الخدمات المرتبطة"
              >
                {serviceLabels.map(label => (
                  <li
                    key={label}
                    className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-foreground"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}
            {project.resultText ? (
              <p className="line-clamp-2 text-sm leading-6 text-foreground/90">
                {project.resultText}
              </p>
            ) : (
              <p className="line-clamp-2 text-sm leading-6 text-foreground-muted">
                {project.summary}
              </p>
            )}
            <p className="pt-1 text-sm font-semibold text-primary">
              اكتشف المشروع
              <span aria-hidden="true"> ←</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
