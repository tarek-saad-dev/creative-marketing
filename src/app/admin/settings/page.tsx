import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StructuredSettingsForm } from "@/components/admin/settings/structured-settings-form";
import {
  CreateSettingDialog,
  EditSettingDialog,
} from "@/components/admin/settings/setting-form-dialogs";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { deleteSiteSettingAction } from "@/server/actions/admin/settings.action";
import {
  getStructuredSiteSettings,
  listAdminSiteSettings,
} from "@/server/services/admin/settings.admin.service";
import { STRUCTURED_SETTING_KEYS } from "@/lib/validation/admin/structured-settings";

export const metadata: Metadata = { title: "الإعدادات العامة" };
export const dynamic = "force-dynamic";

function previewValue(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

export default async function AdminSettingsPage() {
  const user = await requireRole(AdminRole.ADMIN);
  const [structured, settings] = await Promise.all([
    getStructuredSiteSettings(),
    listAdminSiteSettings(),
  ]);

  const structuredKeySet = new Set<string>(
    Object.values(STRUCTURED_SETTING_KEYS)
  );
  const extraSettings = settings.filter(s => !structuredKeySet.has(s.key));
  const isOwner = user.role === AdminRole.OWNER;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="الإعدادات العامة"
        description="محرر منظم للعلامة، التواصل، الشبكات، Hero، وSEO — بدون محرر JSON خام كواجهة أساسية."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الإعدادات العامة" },
        ]}
      />

      <StructuredSettingsForm initial={structured} />

      {isOwner && extraSettings.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">مفاتيح إضافية (OWNER)</h2>
              <p className="text-xs text-foreground-muted">
                مفاتيح غير مدرجة في النموذج المنظم — للتوافق فقط.
              </p>
            </div>
            <CreateSettingDialog />
          </div>
          <div className="admin-card overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>المفتاح</th>
                  <th>القيمة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {extraSettings.map(setting => (
                  <tr key={setting.id}>
                    <td className="font-mono text-xs" dir="ltr">
                      {setting.key}
                    </td>
                    <td
                      className="max-w-sm truncate text-xs text-foreground-muted"
                      dir="ltr"
                    >
                      {previewValue(setting.value)}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <EditSettingDialog setting={setting} />
                        <DeleteRowButton
                          id={setting.id}
                          action={deleteSiteSettingAction}
                          confirmMessage={`حذف الإعداد "${setting.key}"؟`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : isOwner ? (
        <div className="flex justify-end">
          <CreateSettingDialog />
        </div>
      ) : null}
    </div>
  );
}
