import { ProjectCard } from "@/components/sections/work/project-card";
import {
  assignWorkLayoutRoles,
  type WorkLayoutRole,
} from "@/components/sections/work/work-layout";
import type { WorkWallProject } from "@/server/services/project.service";

type WorkWallProps = {
  projects: WorkWallProject[];
};

export function WorkWall({ projects }: WorkWallProps) {
  const videoIndexes = projects
    .map((project, index) =>
      project.primaryMediaType === "VIDEO" ? index : -1
    )
    .filter(index => index >= 0);

  const roles: WorkLayoutRole[] = assignWorkLayoutRoles(projects.length, {
    preferWideIndexes: videoIndexes,
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          role={roles[index] ?? "STANDARD"}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
