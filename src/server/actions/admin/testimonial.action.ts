"use server";

import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  archiveTestimonialAdmin,
  createTestimonialAdmin,
  publishTestimonialAdmin,
  softDeleteTestimonialAdmin,
  unpublishTestimonialAdmin,
  updateTestimonialAdmin,
} from "@/server/services/admin/testimonial.admin.service";

export async function createTestimonialAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "testimonial.create",
        entityType: "Testimonial",
        entityId: result.id,
      }),
    },
    () => createTestimonialAdmin(rawInput)
  );
}

export async function updateTestimonialAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "testimonial.update",
        entityType: "Testimonial",
        entityId: result.id,
      }),
    },
    () => updateTestimonialAdmin(id, rawInput)
  );
}

export async function publishTestimonialAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "testimonial.publish",
        entityType: "Testimonial",
        entityId: result.id,
      }),
    },
    () => publishTestimonialAdmin(id)
  );
}

export async function unpublishTestimonialAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "testimonial.unpublish",
        entityType: "Testimonial",
        entityId: result.id,
      }),
    },
    () => unpublishTestimonialAdmin(id)
  );
}

export async function archiveTestimonialAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "testimonial.archive",
        entityType: "Testimonial",
        entityId: result.id,
      }),
    },
    () => archiveTestimonialAdmin(id)
  );
}

export async function softDeleteTestimonialAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "testimonial.soft_delete",
        entityType: "Testimonial",
        entityId: result.id,
      }),
    },
    () => softDeleteTestimonialAdmin(id)
  );
}
