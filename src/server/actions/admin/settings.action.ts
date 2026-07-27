"use server";

import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import {
  deleteSiteSettingAdmin,
  saveStructuredSiteSettingsAdmin,
  upsertSiteSettingAdmin,
} from "@/server/services/admin/settings.admin.service";

export async function saveStructuredSiteSettingsAction(rawInput: unknown) {
  return withAdminMutation({ minimumRole: AdminRole.ADMIN }, async user =>
    saveStructuredSiteSettingsAdmin({ raw: rawInput, adminUserId: user.id })
  );
}

export async function upsertSiteSettingAction(rawInput: unknown) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.OWNER,
      audit: result => ({
        action: "site_setting.upsert",
        entityType: "SiteSetting",
        entityId: result.id,
        metadata: { key: result.key },
      }),
    },
    () => upsertSiteSettingAdmin(rawInput)
  );
}

export async function deleteSiteSettingAction(id: string) {
  return withAdminMutation(
    {
      minimumRole: AdminRole.OWNER,
      audit: result => ({
        action: "site_setting.delete",
        entityType: "SiteSetting",
        entityId: result.id,
        metadata: { key: result.key },
      }),
    },
    () => deleteSiteSettingAdmin(id)
  );
}
