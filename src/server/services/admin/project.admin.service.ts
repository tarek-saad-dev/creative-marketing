import "server-only";

import { isImageCandidate } from "@/lib/media/public-media";
import { ContentStatus } from "@/generated/prisma";
import {
  projectInputSchema,
  projectMediaInputSchema,
  projectMediaMetaSchema,
  type ProjectFormInput,
} from "@/lib/validation/admin/project";
import {
  createProject,
  createProjectMedia,
  deleteProjectMediaRow,
  findProjectByIdForAdmin,
  findProjectBySlugForAdmin,
  listProjectsForAdmin,
  restoreProject,
  setProjectStatus,
  setProjectCoverFromMedia,
  softDeleteProject,
  updateProject,
  updateProjectMediaMeta,
  type ProjectWriteInput,
} from "@/server/repositories/admin/project.admin.repository";
import { revalidateProject } from "@/server/services/revalidation.service";
import { slugify } from "@/lib/utils";

function toEmptyNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function toWriteInput(input: ProjectFormInput): ProjectWriteInput {
  return {
    slug: input.slug,
    title: input.title.trim(),
    clientName: toEmptyNull(input.clientName),
    industry: toEmptyNull(input.industry),
    summary: input.summary.trim(),
    challenge: toEmptyNull(input.challenge),
    solution: toEmptyNull(input.solution),
    duration: toEmptyNull(input.duration),
    resultText: toEmptyNull(input.resultText),
    coverImageUrl: toEmptyNull(input.coverImageUrl),
    coverImageAlt: toEmptyNull(input.coverImageAlt),
    featured: input.featured,
    displayOrder: input.displayOrder,
    serviceIds: input.serviceIds,
  };
}

export function suggestProjectSlug(title: string): string {
  return slugify(title);
}

export async function listAdminProjects(
  options: { search?: string; includeDeleted?: boolean } = {}
) {
  return listProjectsForAdmin(options);
}

export async function getAdminProjectById(id: string) {
  return findProjectByIdForAdmin(id);
}

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const existing = await findProjectBySlugForAdmin(slug);
  if (existing && existing.id !== excludeId) {
    throw new Error("الرابط مستخدم بالفعل لمشروع آخر");
  }
}

export async function createProjectAdmin(rawInput: unknown) {
  const input = projectInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug);
  const project = await createProject(toWriteInput(input));
  revalidateProject(project.slug);
  return project;
}

export async function updateProjectAdmin(id: string, rawInput: unknown) {
  const input = projectInputSchema.parse(rawInput);
  await assertSlugAvailable(input.slug, id);
  const previous = await findProjectByIdForAdmin(id);
  if (!previous || previous.deletedAt) throw new Error("المشروع غير موجود");
  if (previous.status === ContentStatus.PUBLISHED && (!input.industry?.trim() || !isImageCandidate(input.coverImageUrl) || !input.coverImageAlt?.trim())) throw new Error("أكمل المجال والغلاف ووصفه قبل تعديل مشروع منشور، أو أعده لمسودة");
  const project = await updateProject(id, toWriteInput(input));
  if (previous.slug !== project.slug) revalidateProject(previous.slug);
  revalidateProject(project.slug);
  return project;
}

/** Mirrors `publishedProjectWhere()` completeness rules so publish can never produce a broken public page. */
export async function publishProjectAdmin(id: string) {
  const project = await findProjectByIdForAdmin(id);
  if (!project || project.deletedAt) throw new Error("المشروع غير موجود");

  const missing: string[] = [];
  if (!project.title.trim()) missing.push("العنوان");
  if (!project.slug.trim()) missing.push("الرابط");
  if (!project.industry?.trim()) missing.push("المجال");
  if (!project.summary.trim()) missing.push("الملخص");
  if (!isImageCandidate(project.coverImageUrl)) missing.push("صورة الغلاف");
  if (!project.coverImageAlt?.trim()) missing.push("النص البديل لصورة الغلاف");

  if (missing.length > 0) {
    throw new Error(`لا يمكن النشر — الحقول الناقصة: ${missing.join("، ")}`);
  }

  const updated = await setProjectStatus(id, ContentStatus.PUBLISHED);
  revalidateProject(updated.slug);
  return updated;
}

export async function archiveProjectAdmin(id: string) {
  const updated = await setProjectStatus(id, ContentStatus.ARCHIVED);
  revalidateProject(updated.slug);
  return updated;
}

export async function unpublishToDraftProjectAdmin(id: string) {
  const updated = await setProjectStatus(id, ContentStatus.DRAFT);
  revalidateProject(updated.slug);
  return updated;
}

export async function softDeleteProjectAdmin(id: string) {
  const updated = await softDeleteProject(id);
  revalidateProject(updated.slug);
  return updated;
}

export async function restoreProjectAdmin(id: string) {
  const updated = await restoreProject(id);
  revalidateProject(updated.slug);
  return updated;
}

export async function addProjectMediaAdmin(rawInput: unknown) {
  const input = projectMediaInputSchema.parse(rawInput);
  const owner = await findProjectByIdForAdmin(input.projectId);
  if (!owner || owner.deletedAt) throw new Error("المشروع غير موجود");
  if (input.type === "IMAGE" && !isImageCandidate(input.url)) throw new Error("الملف المحدد ليس رابط صورة");
  const media = await createProjectMedia({
    projectId: input.projectId,
    type: input.type,
    url: input.url,
    thumbnailUrl: toEmptyNull(input.thumbnailUrl),
    altText: toEmptyNull(input.altText),
    caption: toEmptyNull(input.caption),
    width: input.width ?? null,
    height: input.height ?? null,
    displayOrder: input.displayOrder,
    cloudinaryPublicId: toEmptyNull(input.cloudinaryPublicId),
    resourceType: toEmptyNull(input.resourceType),
    format: toEmptyNull(input.format),
    bytes: input.bytes ?? null,
    duration: input.duration ?? null,
  });

  const project = await findProjectByIdForAdmin(input.projectId);
  revalidateProject(project?.slug);
  return media;
}

export async function updateProjectMediaAdmin(id: string, rawInput: unknown) {
  const input = projectMediaMetaSchema.parse(rawInput);
  const updated = await updateProjectMediaMeta(id, {
    altText: toEmptyNull(input.altText),
    caption: toEmptyNull(input.caption),
    displayOrder: input.displayOrder,
  });
  const project = await findProjectByIdForAdmin(updated.projectId);
  revalidateProject(project?.slug);
  return updated;
}

export async function chooseProjectCoverAdmin(projectId: string, mediaId: string) {
  const project = await findProjectByIdForAdmin(projectId);
  if (!project || project.deletedAt) throw new Error("المشروع غير موجود");
  const media = project.media.find(item => item.id === mediaId);
  if (!media || media.type !== "IMAGE" || !isImageCandidate(media.url)) throw new Error("اختر صورة من وسائط المشروع");
  const updated = await setProjectCoverFromMedia(projectId, media.url, media.altText?.trim() || project.title);
  revalidateProject(updated.slug);
  return updated;
}

/** Deletes the DB row only — never calls Cloudinary destroy automatically. */
export async function removeProjectMediaAdmin(id: string) {
  const removed = await deleteProjectMediaRow(id);
  const project = await findProjectByIdForAdmin(removed.projectId);
  revalidateProject(project?.slug);
  return removed;
}
