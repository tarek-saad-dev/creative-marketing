"use server";

import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  createClientLogoAdmin,
  createTrustMetricAdmin,
  deleteClientLogoAdmin,
  deleteTrustMetricAdmin,
  updateClientLogoAdmin,
  updateTrustMetricAdmin,
} from "@/server/services/admin/trust.admin.service";

export async function createTrustMetricAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "trust_metric.create",
        entityType: "TrustMetric",
        entityId: result.id,
      }),
    },
    () => createTrustMetricAdmin(rawInput)
  );
}

export async function updateTrustMetricAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "trust_metric.update",
        entityType: "TrustMetric",
        entityId: result.id,
      }),
    },
    () => updateTrustMetricAdmin(id, rawInput)
  );
}

export async function deleteTrustMetricAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "trust_metric.delete",
        entityType: "TrustMetric",
        entityId: result.id,
      }),
    },
    () => deleteTrustMetricAdmin(id)
  );
}

export async function createClientLogoAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "client_logo.create",
        entityType: "ClientLogo",
        entityId: result.id,
      }),
    },
    () => createClientLogoAdmin(rawInput)
  );
}

export async function updateClientLogoAction(id: string, rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.EDITOR,
      audit: result => ({
        action: "client_logo.update",
        entityType: "ClientLogo",
        entityId: result.id,
      }),
    },
    () => updateClientLogoAdmin(id, rawInput)
  );
}

export async function deleteClientLogoAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.ADMIN,
      audit: result => ({
        action: "client_logo.delete",
        entityType: "ClientLogo",
        entityId: result.id,
      }),
    },
    () => deleteClientLogoAdmin(id)
  );
}
