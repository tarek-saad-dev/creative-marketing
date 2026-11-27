import Link from "next/link";
import { ResilientImage } from "@/components/ui/resilient-media";
import { ArrowUpLeft, Play } from "lucide-react";
import type { WorkLayoutRole } from "@/components/sections/work/work-layout";
import type { WorkWallProject } from "@/server/services/project.service";

export function ProjectCard({ project, role, priority=false, wideArtwork=false }: { project: WorkWallProject; role: WorkLayoutRole; priority?: boolean; wideArtwork?: boolean }) {
  const wide=wideArtwork||role==="LEAD"||role==="WIDE";
  return (
    <article className="group min-w-0">
      <Link href={"/work/"+project.slug} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className={"relative overflow-hidden rounded-lg bg-[#20285d]/75 "+(wide?"aspect-[4/3] md:aspect-[16/9] md:max-h-[520px]":"aspect-[4/3]")}>
          <ResilientImage src={project.coverImageUrl} alt={project.coverImageAlt} priority={priority} sizes={wide?"(max-width: 768px) 100vw, 90vw":"(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"} />
          {project.primaryMediaType==="VIDEO"&&<span className="absolute start-3 top-3 flex items-center gap-1 rounded-full bg-[#1a245a]/90 px-3 py-2 text-xs text-white"><Play size={15} aria-hidden="true"/> فيديو</span>}
        </div>
        <div className="flex items-center justify-between gap-3 py-4">
          <div className="min-w-0 space-y-1">
            {project.industry&&<p className="break-words text-xs text-foreground-muted">{project.industry}</p>}
            <h3 className="break-words font-headline text-lg font-bold text-foreground sm:text-xl group-hover:text-brand-aqua">{project.title}</h3>
          </div>
          <ArrowUpLeft className="shrink-0 text-brand-aqua" size={23} aria-hidden="true"/>
        </div>
      </Link>
    </article>
  );
}
