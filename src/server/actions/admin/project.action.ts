"use server";

import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  addProjectMediaAdmin,
  archiveProjectAdmin,
  createProjectAdmin,
  publishProjectAdmin,
  removeProjectMediaAdmin,
  restoreProjectAdmin,
  softDeleteProjectAdmin,
  unpublishToDraftProjectAdmin,
  updateProjectAdmin,
  updateProjectMediaAdmin,
} from "@/server/services/admin/project.admin.service";

export async function createProjectAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "project.create",
        entityType: "Project",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => createProjectAdmin(rawInput)
  );
}

export async function updateProjectAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "project.update",
        entityType: "Project",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => updateProjectAdmin(id, rawInput)
  );
}

export async function publishProjectAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "project.publish",
        entityType: "Project",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => publishProjectAdmin(id)
  );
}

export async function unpublishProjectAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "project.unpublish",
        entityType: "Project",
        entityId: result.id,
      }),
    },
    () => unpublishToDraftProjectAdmin(id)
  );
}

export async function archiveProjectAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "project.archive",
        entityType: "Project",
        entityId: result.id,
      }),
    },
    () => archiveProjectAdmin(id)
  );
}

export async function softDeleteProjectAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "project.soft_delete",
        entityType: "Project",
        entityId: result.id,
      }),
    },
    () => softDeleteProjectAdmin(id)
  );
}

export async function restoreProjectAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "project.restore",
        entityType: "Project",
        entityId: result.id,
      }),
    },
    () => restoreProjectAdmin(id)
  );
}

export async function addProjectMediaAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "project.media.add",
        entityType: "ProjectMedia",
        entityId: result.id,
      }),
    },
    () => addProjectMediaAdmin(rawInput)
  );
}

export async function updateProjectMediaAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "project.media.update",
        entityType: "ProjectMedia",
        entityId: result.id,
      }),
    },
    () => updateProjectMediaAdmin(id, rawInput)
  );
}

export async function removeProjectMediaAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "project.media.remove",
        entityType: "ProjectMedia",
        entityId: result.id,
      }),
    },
    () => removeProjectMediaAdmin(id)
  );
}
