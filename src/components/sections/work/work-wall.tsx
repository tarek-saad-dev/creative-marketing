import { ProjectCard } from "@/components/sections/work/project-card";
import { editorialGridSpans } from "@/lib/content/editorial-grid";
import type { WorkWallProject } from "@/server/services/project.service";

const spanClasses:Record<number,string>={2:"xl:col-span-2",3:"xl:col-span-3",6:"xl:col-span-6"};
export function WorkWall({ projects }: { projects: WorkWallProject[] }) {
  const spans=editorialGridSpans(projects.length);
  return (
    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-9 md:grid-cols-2 xl:grid-cols-6 xl:gap-x-8">
      {projects.map((project,index)=><div key={project.id} className={"min-w-0 "+spanClasses[spans[index]]+(projects.length%2===1&&index===projects.length-1?" md:col-span-2":"")}>
        <ProjectCard project={project} role="STANDARD" wideArtwork={spans[index]===6} />
      </div>)}
    </div>
  );
}
