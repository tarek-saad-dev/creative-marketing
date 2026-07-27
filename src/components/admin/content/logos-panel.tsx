import Link from "next/link";
import { ToneBadge } from "@/components/admin/status-badge";
import { listAdminClientLogos } from "@/server/services/admin/trust.admin.service";
import {
  CreateClientLogoDialog,
  EditClientLogoDialog,
} from "@/components/admin/trust/trust-form-dialogs";
import { isUsableMediaUrl } from "@/lib/media/public-media";
import {
  ManualImageHint,
  ViewerReadonlyBanner,
} from "@/components/admin/content/content-helpers";

export async function LogosPanel({ canEdit }: { canEdit: boolean }) {
  const logos = await listAdminClientLogos();

  return (
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            شعارات العملاء
          </h2>
          <p className="text-sm text-foreground-muted">
            شبكة بصرية للشعارات — الرابط اختياري.
          </p>
        </div>
        {canEdit ? <CreateClientLogoDialog /> : null}
      </div>

      <ManualImageHint />

      {logos.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-foreground-muted">
          لا توجد شعارات بعد.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {logos.map(logo => (
            <article
              key={logo.id}
              className="admin-card flex flex-col items-center gap-3 p-4 text-center"
            >
              <div className="flex h-16 w-full items-center justify-center">
                {isUsableMediaUrl(logo.logoUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo.logoUrl}
                    alt={logo.name}
                    className="max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-foreground-muted">
                    بدون صورة
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">{logo.name}</p>
              <ToneBadge
                label={logo.isActive ? "ظاهر" : "مخفي"}
                tone={logo.isActive ? "success" : "neutral"}
              />
              {canEdit ? <EditClientLogoDialog logo={logo} /> : null}
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        الصفحة المتقدمة:{" "}
        <Link
          href="/admin/client-logos"
          className="text-primary hover:underline"
        >
          إدارة الشعارات
        </Link>
      </p>
    </div>
  );
}
