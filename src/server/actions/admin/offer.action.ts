"use server";

import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  activateOfferAdmin,
  createOfferAdmin,
  disableOfferAdmin,
  updateOfferAdmin,
} from "@/server/services/admin/offer.admin.service";

export async function createOfferAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "offer.create",
        entityType: "LimitedOffer",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => createOfferAdmin(rawInput)
  );
}

export async function updateOfferAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "offer.update",
        entityType: "LimitedOffer",
        entityId: result.id,
        metadata: { slug: result.slug },
      }),
    },
    () => updateOfferAdmin(id, rawInput)
  );
}

export async function activateOfferAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "offer.activate",
        entityType: "LimitedOffer",
        entityId: result.id,
        metadata: { status: result.status },
      }),
    },
    () => activateOfferAdmin(id)
  );
}

export async function disableOfferAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "offer.disable",
        entityType: "LimitedOffer",
        entityId: result.id,
      }),
    },
    () => disableOfferAdmin(id)
  );
}
