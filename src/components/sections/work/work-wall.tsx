import { ProjectCard } from "@/components/sections/work/project-card";
import type { WorkWallProject } from "@/server/services/project.service";

export function WorkWall({ projects }: { projects: WorkWallProject[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 md:gap-5">
      {projects.map((project) => <ProjectCard key={project.id} project={project} role="STANDARD" />)}
    </div>
  );
}
