import Link from "next/link";
import { getStructuredSiteSettings } from "@/server/services/admin/settings.admin.service";
import { StructuredSettingsForm } from "@/components/admin/settings/structured-settings-form";
import {
  OpenSiteLink,
  ViewerReadonlyBanner,
} from "@/components/admin/content/content-helpers";

export async function SettingsPanel({ canEdit }: { canEdit: boolean }) {
  const structured = await getStructuredSiteSettings();

  return (
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            بيانات الموقع
          </h2>
          <p className="text-sm text-foreground-muted">
            عدّل البراند والتواصل والواجهة الرئيسية من مكان واحد.
          </p>
        </div>
        <OpenSiteLink label="معاينة الموقع" />
      </div>

      {canEdit ? (
        <StructuredSettingsForm initial={structured} />
      ) : (
        <div className="admin-card space-y-2 p-4 text-sm">
          <p>
            <span className="text-foreground-muted">البراند: </span>
            {structured.brandName || "—"}
          </p>
          <p>
            <span className="text-foreground-muted">واتساب: </span>
            <span dir="ltr">{structured.whatsapp || "—"}</span>
          </p>
          <p>
            <span className="text-foreground-muted">البريد: </span>
            <span dir="ltr">{structured.email || "—"}</span>
          </p>
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        للإعدادات المتقدمة:{" "}
        <Link href="/admin/settings" className="text-primary hover:underline">
          صفحة الإعدادات
        </Link>
      </p>
    </div>
  );
}
