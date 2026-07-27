import "server-only";

import { prisma } from "@/lib/db/prisma";
import { ContentStatus, type Prisma } from "@/generated/prisma";
import { projectDetailSelect } from "@/server/repositories/project-publication";

export const adminProjectListSelect = {
  id: true,
  slug: true,
  title: true,
  clientName: true,
  industry: true,
  status: true,
  featured: true,
  displayOrder: true,
  coverImageUrl: true,
  coverImageAlt: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  _count: { select: { media: true, projectServices: true } },
} satisfies Prisma.ProjectSelect;

export type AdminProjectListRow = Prisma.ProjectGetPayload<{
  select: typeof adminProjectListSelect;
}>;

export async function listProjectsForAdmin(
  options: {
    includeDeleted?: boolean;
    status?: ContentStatus;
    search?: string;
  } = {}
): Promise<AdminProjectListRow[]> {
  const where: Prisma.ProjectWhereInput = {
    ...(options.includeDeleted ? {} : { deletedAt: null }),
    ...(options.status ? { status: options.status } : {}),
    ...(options.search
      ? {
          OR: [
            { title: { contains: options.search, mode: "insensitive" } },
            { slug: { contains: options.search, mode: "insensitive" } },
            { clientName: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return prisma.project.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: adminProjectListSelect,
  });
}

export const adminProjectDetailSelect = {
  id: true,
  slug: true,
  title: true,
  clientName: true,
  industry: true,
  summary: true,
  challenge: true,
  solution: true,
  duration: true,
  resultText: true,
  coverImageUrl: true,
  coverImageAlt: true,
  featured: true,
  status: true,
  displayOrder: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  media: {
    orderBy: { displayOrder: "asc" as const },
    select: {
      id: true,
      type: true,
      url: true,
      thumbnailUrl: true,
      altText: true,
      caption: true,
      width: true,
      height: true,
      displayOrder: true,
      cloudinaryPublicId: true,
      resourceType: true,
      format: true,
      bytes: true,
      duration: true,
    },
  },
  projectServices: {
    select: {
      serviceId: true,
      service: { select: { id: true, nameAr: true, nameEn: true } },
    },
  },
} satisfies Prisma.ProjectSelect;

export type AdminProjectDetail = Prisma.ProjectGetPayload<{
  select: typeof adminProjectDetailSelect;
}>;

export async function findProjectByIdForAdmin(
  id: string
): Promise<AdminProjectDetail | null> {
  return prisma.project.findUnique({
    where: { id },
    select: adminProjectDetailSelect,
  });
}

export async function findProjectBySlugForAdmin(
  slug: string
): Promise<{ id: string } | null> {
  return prisma.project.findUnique({ where: { slug }, select: { id: true } });
}

/** Draft Mode preview — any status, excludes soft-deleted only. */
export async function findProjectDetailForPreviewBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, deletedAt: null },
    select: projectDetailSelect,
  });
}

export type ProjectWriteInput = {
  slug: string;
  title: string;
  clientName: string | null;
  industry: string | null;
  summary: string;
  challenge: string | null;
  solution: string | null;
  duration: string | null;
  resultText: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featured: boolean;
  displayOrder: number;
  serviceIds: string[];
};

export async function createProject(input: ProjectWriteInput) {
  return prisma.$transaction(async tx => {
    const project = await tx.project.create({
      data: {
        slug: input.slug,
        title: input.title,
        clientName: input.clientName,
        industry: input.industry,
        summary: input.summary,
        challenge: input.challenge,
        solution: input.solution,
        duration: input.duration,
        resultText: input.resultText,
        coverImageUrl: input.coverImageUrl,
        coverImageAlt: input.coverImageAlt,
        featured: input.featured,
        displayOrder: input.displayOrder,
        status: ContentStatus.DRAFT,
      },
      select: { id: true, slug: true },
    });

    if (input.serviceIds.length > 0) {
      await tx.projectService.createMany({
        data: input.serviceIds.map(serviceId => ({
          projectId: project.id,
          serviceId,
        })),
        skipDuplicates: true,
      });
    }

    return project;
  });
}

export async function updateProject(id: string, input: ProjectWriteInput) {
  return prisma.$transaction(async tx => {
    const project = await tx.project.update({
      where: { id },
      data: {
        slug: input.slug,
        title: input.title,
        clientName: input.clientName,
        industry: input.industry,
        summary: input.summary,
        challenge: input.challenge,
        solution: input.solution,
        duration: input.duration,
        resultText: input.resultText,
        coverImageUrl: input.coverImageUrl,
        coverImageAlt: input.coverImageAlt,
        featured: input.featured,
        displayOrder: input.displayOrder,
      },
      select: { id: true, slug: true },
    });

    await tx.projectService.deleteMany({ where: { projectId: id } });
    if (input.serviceIds.length > 0) {
      await tx.projectService.createMany({
        data: input.serviceIds.map(serviceId => ({
          projectId: id,
          serviceId,
        })),
        skipDuplicates: true,
      });
    }

    return project;
  });
}

export async function setProjectStatus(
  id: string,
  status: ContentStatus
): Promise<{ id: string; slug: string; status: ContentStatus }> {
  return prisma.project.update({
    where: { id },
    data: {
      status,
      publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined,
    },
    select: { id: true, slug: true, status: true },
  });
}

export async function softDeleteProject(
  id: string
): Promise<{ id: string; slug: string }> {
  return prisma.project.update({
    where: { id },
    data: { deletedAt: new Date(), status: ContentStatus.ARCHIVED },
    select: { id: true, slug: true },
  });
}

export async function restoreProject(
  id: string
): Promise<{ id: string; slug: string }> {
  return prisma.project.update({
    where: { id },
    data: { deletedAt: null },
    select: { id: true, slug: true },
  });
}

export type ProjectMediaCreateInput = {
  projectId: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  displayOrder: number;
  cloudinaryPublicId: string | null;
  resourceType: string | null;
  format: string | null;
  bytes: number | null;
  duration: number | null;
};

export async function createProjectMedia(input: ProjectMediaCreateInput) {
  return prisma.projectMedia.create({
    data: input,
    select: { id: true, projectId: true },
  });
}

export async function updateProjectMediaMeta(
  id: string,
  input: {
    altText: string | null;
    caption: string | null;
    displayOrder: number;
  }
) {
  return prisma.projectMedia.update({
    where: { id },
    data: input,
    select: { id: true, projectId: true },
  });
}

/** Removes the DB row only. Cloudinary asset is left untouched (see cloudinary.service.ts). */
export async function deleteProjectMediaRow(id: string): Promise<{
  id: string;
  projectId: string;
  cloudinaryPublicId: string | null;
  resourceType: string | null;
}> {
  return prisma.projectMedia.delete({
    where: { id },
    select: {
      id: true,
      projectId: true,
      cloudinaryPublicId: true,
      resourceType: true,
    },
  });
}

export async function countProjectsByStatus() {
  return prisma.project.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: { _all: true },
    orderBy: { status: "asc" },
  });
}
