import "server-only";

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
  const project = await updateProject(id, toWriteInput(input));
  revalidateProject(project.slug);
  return project;
}

/** Mirrors `publishedProjectWhere()` completeness rules so publish can never produce a broken public page. */
export async function publishProjectAdmin(id: string) {
  const project = await findProjectByIdForAdmin(id);
  if (!project) throw new Error("المشروع غير موجود");

  const missing: string[] = [];
  if (!project.title.trim()) missing.push("العنوان");
  if (!project.slug.trim()) missing.push("الرابط");
  if (!project.industry?.trim()) missing.push("المجال");
  if (!project.summary.trim()) missing.push("الملخص");
  if (!project.coverImageUrl?.trim()) missing.push("صورة الغلاف");
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
  return updateProjectMediaMeta(id, {
    altText: toEmptyNull(input.altText),
    caption: toEmptyNull(input.caption),
    displayOrder: input.displayOrder,
  });
}

/** Deletes the DB row only — never calls Cloudinary destroy automatically. */
export async function removeProjectMediaAdmin(id: string) {
  const removed = await deleteProjectMediaRow(id);
  const project = await findProjectByIdForAdmin(removed.projectId);
  revalidateProject(project?.slug);
  return removed;
}
