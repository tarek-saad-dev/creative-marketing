import "server-only";

import type { ServiceCategory } from "@/generated/prisma";
import {
  findFeaturedPublishedProjects,
  findPublishedProjectBySlug,
  findPublishedProjectSlugs,
  findPublishedProjectsForServicePreviews,
  findRelatedPublishedProjects,
} from "@/server/repositories/project.repository";
import { findProjectDetailForPreviewBySlug } from "@/server/repositories/admin/project.admin.repository";
import { findActiveServices } from "@/server/repositories/service.repository";
import {
  SERVICE_CATEGORY_META,
  SERVICE_CATEGORY_ORDER,
} from "@/lib/content/service-categories";

export type WorkWallProject = {
  id: string;
  slug: string;
  title: string;
  clientName: string | null;
  industry: string | null;
  summary: string;
  coverImageUrl: string;
  coverImageAlt: string;
  resultText: string | null;
  duration: string | null;
  displayOrder: number;
  primaryMediaType: "IMAGE" | "VIDEO" | null;
  services: Array<{
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    category: ServiceCategory;
  }>;
};

export type ProjectDetail = {
  id: string;
  slug: string;
  title: string;
  clientName: string | null;
  industry: string | null;
  summary: string;
  challenge: string | null;
  solution: string | null;
  duration: string | null;
  resultText: string | null;
  coverImageUrl: string;
  coverImageAlt: string;
  featured: boolean;
  displayOrder: number;
  publishedAt: Date | null;
  media: Array<{
    id: string;
    type: "IMAGE" | "VIDEO";
    url: string;
    thumbnailUrl: string | null;
    altText: string | null;
    caption: string | null;
    width: number | null;
    height: number | null;
    displayOrder: number;
  }>;
  services: Array<{
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    category: ServiceCategory;
    summaryAr: string;
  }>;
};

export type RelatedProjectCard = {
  id: string;
  slug: string;
  title: string;
  industry: string | null;
  summary: string;
  coverImageUrl: string;
  coverImageAlt: string;
};

export type ServiceCategoryEcosystem = {
  category: ServiceCategory;
  labelEn: string;
  titleAr: string;
  descriptionAr: string;
  services: Array<{
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    summaryAr: string;
  }>;
  projectPreview: {
    id: string;
    slug: string;
    title: string;
    coverImageUrl: string;
    coverImageAlt: string;
  } | null;
};

function mapWorkWallProject(
  project: Awaited<ReturnType<typeof findFeaturedPublishedProjects>>[number]
): WorkWallProject | null {
  if (!project.coverImageUrl || !project.coverImageAlt) return null;

  const primary = project.media[0];

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    clientName: project.clientName,
    industry: project.industry,
    summary: project.summary,
    coverImageUrl: project.coverImageUrl,
    coverImageAlt: project.coverImageAlt,
    resultText: project.resultText,
    duration: project.duration,
    displayOrder: project.displayOrder,
    primaryMediaType: primary?.type ?? null,
    services: project.projectServices.map(ps => ps.service),
  };
}

export async function getFeaturedWorkWallProjects(): Promise<
  WorkWallProject[]
> {
  const rows = await findFeaturedPublishedProjects();
  return rows
    .map(mapWorkWallProject)
    .filter((project): project is WorkWallProject => project !== null);
}

function mapProjectDetail(
  project: NonNullable<Awaited<ReturnType<typeof findPublishedProjectBySlug>>>
): ProjectDetail | null {
  if (!project.coverImageUrl || !project.coverImageAlt) return null;

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    clientName: project.clientName,
    industry: project.industry,
    summary: project.summary,
    challenge: project.challenge,
    solution: project.solution,
    duration: project.duration,
    resultText: project.resultText,
    coverImageUrl: project.coverImageUrl,
    coverImageAlt: project.coverImageAlt,
    featured: project.featured,
    displayOrder: project.displayOrder,
    publishedAt: project.publishedAt,
    media: project.media.map(item => ({
      id: item.id,
      type: item.type,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      altText: item.altText,
      caption: item.caption,
      width: item.width,
      height: item.height,
      displayOrder: item.displayOrder,
    })),
    services: project.projectServices.map(ps => ps.service),
  };
}

export async function getPublishedProjectBySlug(
  slug: string
): Promise<ProjectDetail | null> {
  const project = await findPublishedProjectBySlug(slug);
  if (!project) return null;
  return mapProjectDetail(project);
}

/**
 * Draft Mode preview only — ignores publish status/date, still excludes
 * soft-deleted projects. Callers MUST check `draftMode().isEnabled` (itself
 * only reachable via the admin-gated `enablePreviewAction`) before calling.
 */
export async function getProjectBySlugForPreview(
  slug: string
): Promise<ProjectDetail | null> {
  const project = await findProjectDetailForPreviewBySlug(slug);
  if (!project) return null;
  return mapProjectDetail(project);
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  return findPublishedProjectSlugs();
}

export async function getRelatedPublishedProjects(
  project: ProjectDetail
): Promise<RelatedProjectCard[]> {
  const related = await findRelatedPublishedProjects({
    excludeProjectId: project.id,
    serviceIds: project.services.map(service => service.id),
    industry: project.industry,
    limit: 3,
  });

  return related
    .filter(row => row.coverImageUrl && row.coverImageAlt)
    .map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      industry: row.industry,
      summary: row.summary,
      coverImageUrl: row.coverImageUrl!,
      coverImageAlt: row.coverImageAlt!,
    }));
}

export async function getServicesEcosystem(
  preloadedServices?: Awaited<ReturnType<typeof findActiveServices>>
): Promise<ServiceCategoryEcosystem[]> {
  const [services, previewProjects] = await Promise.all([
    preloadedServices
      ? Promise.resolve(preloadedServices)
      : findActiveServices(),
    findPublishedProjectsForServicePreviews(),
  ]);

  return buildServicesEcosystem(services, previewProjects);
}

export function buildServicesEcosystem(
  services: Awaited<ReturnType<typeof findActiveServices>>,
  previewProjects: Awaited<
    ReturnType<typeof findPublishedProjectsForServicePreviews>
  >
): ServiceCategoryEcosystem[] {
  return SERVICE_CATEGORY_ORDER.map(category => {
    const meta = SERVICE_CATEGORY_META[category];
    const categoryServices = services
      .filter(service => service.category === category)
      .map(service => ({
        id: service.id,
        slug: service.slug,
        nameAr: service.nameAr,
        nameEn: service.nameEn,
        summaryAr: service.summaryAr,
      }));

    const previewCandidate = previewProjects.find(project =>
      project.projectServices.some(ps => ps.service.category === category)
    );

    const projectPreview =
      previewCandidate?.coverImageUrl && previewCandidate.coverImageAlt
        ? {
            id: previewCandidate.id,
            slug: previewCandidate.slug,
            title: previewCandidate.title,
            coverImageUrl: previewCandidate.coverImageUrl,
            coverImageAlt: previewCandidate.coverImageAlt,
          }
        : null;

    return {
      category,
      labelEn: meta.labelEn,
      titleAr: meta.titleAr,
      descriptionAr: meta.descriptionAr,
      services: categoryServices,
      projectPreview,
    };
  }).filter(group => group.services.length > 0);
}
