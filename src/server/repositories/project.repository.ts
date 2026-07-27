import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  featuredPublishedProjectWhere,
  projectCardSelect,
  projectDetailSelect,
  publishedProjectOrderBy,
  publishedProjectWhere,
} from "@/server/repositories/project-publication";

export async function findFeaturedPublishedProjects(now: Date = new Date()) {
  return prisma.project.findMany({
    where: featuredPublishedProjectWhere(now),
    orderBy: publishedProjectOrderBy,
    select: projectCardSelect,
  });
}

export async function findPublishedProjectBySlug(
  slug: string,
  now: Date = new Date()
) {
  return prisma.project.findFirst({
    where: {
      ...publishedProjectWhere(now),
      slug,
    },
    select: projectDetailSelect,
  });
}

export async function findPublishedProjectSlugs(now: Date = new Date()) {
  const rows = await prisma.project.findMany({
    where: publishedProjectWhere(now),
    orderBy: publishedProjectOrderBy,
    select: { slug: true },
  });
  return rows.map(row => row.slug);
}

export type RelatedProjectCandidate = {
  id: string;
  slug: string;
  title: string;
  industry: string | null;
  summary: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featured: boolean;
  displayOrder: number;
  serviceIds: string[];
};

/**
 * Related projects: shared services → shared industry → featured → display order.
 * Excludes current project. Caps at `limit`.
 */
export async function findRelatedPublishedProjects(options: {
  excludeProjectId: string;
  serviceIds: string[];
  industry: string | null;
  limit?: number;
  now?: Date;
}): Promise<RelatedProjectCandidate[]> {
  const {
    excludeProjectId,
    serviceIds,
    industry,
    limit = 3,
    now = new Date(),
  } = options;

  const candidates = await prisma.project.findMany({
    where: {
      ...publishedProjectWhere(now),
      id: { not: excludeProjectId },
    },
    orderBy: publishedProjectOrderBy,
    select: {
      id: true,
      slug: true,
      title: true,
      industry: true,
      summary: true,
      coverImageUrl: true,
      coverImageAlt: true,
      featured: true,
      displayOrder: true,
      projectServices: {
        select: { serviceId: true },
      },
    },
  });

  const serviceSet = new Set(serviceIds);

  const scored = candidates.map(project => {
    const projectServiceIds = project.projectServices.map(ps => ps.serviceId);
    const sharedServices = projectServiceIds.filter(id =>
      serviceSet.has(id)
    ).length;
    const sharedIndustry =
      industry && project.industry && industry === project.industry ? 1 : 0;
    const featuredScore = project.featured ? 1 : 0;

    return {
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
        industry: project.industry,
        summary: project.summary,
        coverImageUrl: project.coverImageUrl,
        coverImageAlt: project.coverImageAlt,
        featured: project.featured,
        displayOrder: project.displayOrder,
        serviceIds: projectServiceIds,
      },
      score: sharedServices * 100 + sharedIndustry * 10 + featuredScore * 5,
    };
  });

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.project.displayOrder !== b.project.displayOrder) {
        return a.project.displayOrder - b.project.displayOrder;
      }
      return a.project.id.localeCompare(b.project.id);
    })
    .slice(0, limit)
    .map(row => row.project);
}

/** Lightweight published projects for service-category previews (one per category preferred). */
export async function findPublishedProjectsForServicePreviews(
  now: Date = new Date()
) {
  return prisma.project.findMany({
    where: publishedProjectWhere(now),
    orderBy: publishedProjectOrderBy,
    select: {
      id: true,
      slug: true,
      title: true,
      coverImageUrl: true,
      coverImageAlt: true,
      featured: true,
      displayOrder: true,
      projectServices: {
        select: {
          service: {
            select: {
              id: true,
              category: true,
            },
          },
        },
      },
    },
  });
}
