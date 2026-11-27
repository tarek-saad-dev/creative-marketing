import "server-only";
import {PROJECT_PAGE_SIZE,type ProjectFilters} from "@/lib/admin/project-filters";
import { planMediaMove, planMediaDrop } from "@/lib/media/portfolio-layout";

import { prisma } from "@/lib/db/prisma";
import { ContentStatus, type Prisma } from "@/generated/prisma";
import { projectDetailSelect } from "@/server/repositories/project-publication";

export const adminProjectListSelect = {
  id: true,
  slug: true,
  title: true,
  clientName: true,
  industry: true,
  summary: true,
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
    orderBy: [{ displayOrder: "asc" as const }, { id: "asc" as const }],
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

export async function createProjectMedia(input: ProjectMediaCreateInput, autoCoverAlt?:string) {
  return prisma.$transaction(async tx=>{
    const media=await tx.projectMedia.create({data:input,select:{id:true,projectId:true}});
    if(autoCoverAlt && input.type==="IMAGE") await tx.project.updateMany({where:{id:input.projectId,deletedAt:null,status:ContentStatus.DRAFT,OR:[{coverImageUrl:null},{coverImageUrl:""}]},data:{coverImageUrl:input.url,coverImageAlt:autoCoverAlt}});
    return media;
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

export async function setProjectCoverFromMedia(id: string, url: string, alt: string) {
  return prisma.project.update({where:{id,deletedAt:null},data:{coverImageUrl:url,coverImageAlt:alt},select:{id:true,slug:true}});
}

/** Atomically reorder only media belonging to the active project. */
export async function moveProjectMedia(projectId: string, mediaId: string, direction: -1 | 1) {
  return prisma.$transaction(async tx => {
    const project=await tx.project.findFirst({where:{id:projectId,deletedAt:null},select:{id:true,slug:true}});
    if(!project)throw new Error("المشروع غير موجود");
    const items=await tx.projectMedia.findMany({where:{projectId},select:{id:true,displayOrder:true}});
    if(!items.some(item=>item.id===mediaId))throw new Error("الوسيط غير موجود داخل المشروع");
    const updates=planMediaMove(items,mediaId,direction);
    for(const item of updates)await tx.projectMedia.update({where:{id:item.id},data:{displayOrder:item.displayOrder}});
    return project;
  },{isolationLevel:"Serializable",timeout:20000});
}

export async function dropProjectMedia(projectId:string,mediaId:string,targetId:string) {
  return prisma.$transaction(async tx=>{
    const project=await tx.project.findFirst({where:{id:projectId,deletedAt:null},select:{id:true,slug:true}});
    if(!project)throw new Error("المشروع غير موجود");
    const items=await tx.projectMedia.findMany({where:{projectId},select:{id:true,displayOrder:true}});
    if(!items.some(item=>item.id===mediaId)||!items.some(item=>item.id===targetId))throw new Error("اختر وسائط من نفس المشروع");
    for(const item of planMediaDrop(items,mediaId,targetId))await tx.projectMedia.update({where:{id:item.id},data:{displayOrder:item.displayOrder}});
    return project;
  },{isolationLevel:"Serializable",timeout:20000});
}

export async function queryProjectsForAdmin(filters:ProjectFilters){
 const where:Prisma.ProjectWhereInput={
  deletedAt:filters.status==="deleted"?{not:null}:null,
  ...(filters.status==="published"?{status:ContentStatus.PUBLISHED}:filters.status==="draft"?{status:ContentStatus.DRAFT}:filters.status==="archived"?{status:ContentStatus.ARCHIVED}:{}),
  ...(filters.industry?{industry:filters.industry}:{}),
  ...(filters.q?{OR:[{title:{contains:filters.q,mode:"insensitive"}},{clientName:{contains:filters.q,mode:"insensitive"}},{industry:{contains:filters.q,mode:"insensitive"}},{slug:{contains:filters.q,mode:"insensitive"}}]}:{})
 };
 const [total,grouped,deleted,industries]=await Promise.all([
  prisma.project.count({where}),
  prisma.project.groupBy({by:["status"],where:{deletedAt:null},_count:{_all:true},orderBy:{status:"asc"}}),
  prisma.project.count({where:{deletedAt:{not:null}}}),
  prisma.project.findMany({where:{deletedAt:null,industry:{not:null}},select:{industry:true},distinct:["industry"],orderBy:{industry:"asc"}})
 ]);
 const pages=Math.max(1,Math.ceil(total/PROJECT_PAGE_SIZE));const page=Math.min(filters.page,pages);
 const orderBy:Prisma.ProjectOrderByWithRelationInput[]=filters.sort==="name"?[{title:"asc"},{id:"asc"}]:filters.sort==="oldest"?[{updatedAt:"asc"},{id:"asc"}]:[{updatedAt:"desc"},{id:"asc"}];
 const rows=await prisma.project.findMany({where,orderBy,skip:(page-1)*PROJECT_PAGE_SIZE,take:PROJECT_PAGE_SIZE,select:adminProjectListSelect});
 const count=(status:ContentStatus)=>grouped.find(g=>g.status===status)?._count._all??0;
 return {rows,total,page,pages,industries:industries.flatMap(i=>i.industry?[i.industry]:[]),counts:{all:grouped.reduce((sum,g)=>sum+g._count._all,0),published:count(ContentStatus.PUBLISHED),draft:count(ContentStatus.DRAFT),archived:count(ContentStatus.ARCHIVED),deleted}};
}
