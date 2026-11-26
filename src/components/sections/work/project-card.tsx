import Link from "next/link";
import Image from "next/image";
import { ArrowUpLeft, Play } from "lucide-react";
import { canUseNextImage } from "@/lib/media/public-media";
import type { WorkLayoutRole } from "@/components/sections/work/work-layout";
import type { WorkWallProject } from "@/server/services/project.service";

export function ProjectCard({ project, role }: { project: WorkWallProject; role: WorkLayoutRole; priority?: boolean }) {
  const wide = role === "LEAD" || role === "WIDE";
  return (
    <article className={"group min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-[#202b62]/45 " + (wide ? "md:col-span-2" : "md:col-span-1")}>
      <Link href={"/work/" + project.slug} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <div className={"relative overflow-hidden bg-[#1a245a]/60 " + (wide ? "aspect-[4/3] md:aspect-[16/10]" : "aspect-[4/3]")}>
          {canUseNextImage(project.coverImageUrl) ? (
            <Image src={project.coverImageUrl} alt={project.coverImageAlt} fill sizes={wide ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} className="object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.coverImageUrl} alt={project.coverImageAlt} className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
          )}
          {project.primaryMediaType === "VIDEO" && <span className="absolute start-3 top-3 flex items-center gap-1 rounded-full bg-[#1a245a]/90 px-3 py-2 text-xs text-white"><Play size={15} aria-hidden="true" /> VIDEO</span>}
        </div>
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0 space-y-1.5">
            {project.industry && <p className="text-xs font-semibold text-brand-aqua">{project.industry}</p>}
            <h3 className="break-words font-headline text-lg font-bold text-foreground sm:text-xl">{project.title}</h3>
            <p className="line-clamp-2 text-sm leading-7 text-foreground-muted">{project.summary}</p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 text-brand-aqua group-hover:bg-brand-aqua group-hover:text-brand-navy"><ArrowUpLeft size={22} aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  );
}
