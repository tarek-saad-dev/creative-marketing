import Link from "next/link";
import { ContentStatus } from "@/generated/prisma";
import { ContentStatusBadge, ToneBadge } from "@/components/admin/status-badge";
import { listAdminPackages } from "@/server/services/admin/package.admin.service";
import {
  CreatePackageDialog,
  EditPackageDialog,
} from "@/components/admin/packages/package-form-dialogs";
import { RowActionButton } from "@/components/admin/row-action-button";
import {
  publishPackageAction,
  unpublishPackageAction,
} from "@/server/actions/admin/package.action";
import { hasValidConfiguredPrice } from "@/lib/validation/pricing";
import { decimalToPublicString } from "@/lib/validation/decimal-price";
import { ViewerReadonlyBanner } from "@/components/admin/content/content-helpers";

export async function PackagesPanel({
  canEdit,
  canPublish = canEdit,
}: {
  canEdit: boolean;
  canPublish?: boolean;
}) {
  const packages = await listAdminPackages();

  return (
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            الباكدجات
          </h2>
          <p className="text-sm text-foreground-muted">
            حدّد الأسعار والميزات — النشر يبقى محميًا حتى اكتمال البيانات.
          </p>
        </div>
        {canEdit ? <CreatePackageDialog /> : null}
      </div>

      {packages.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-foreground-muted">
          لا توجد باكدجات بعد.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map(pkg => {
            const priceValid = hasValidConfiguredPrice(pkg.originalPrice);
            return (
              <article key={pkg.id} className="admin-card flex flex-col p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {pkg.name}
                    </h3>
                    {pkg.isFeatured ? (
                      <p className="text-xs font-medium text-primary">
                        الباقة المميزة
                      </p>
                    ) : null}
                  </div>
                  <ContentStatusBadge status={pkg.status} />
                </div>

                <div className="mb-4 space-y-1 text-sm">
                  {priceValid ? (
                    <p dir="ltr" className="font-semibold text-foreground">
                      {decimalToPublicString(pkg.originalPrice)} {pkg.currency}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <ToneBadge label="السعر غير محدد" tone="warning" />
                      {canEdit ? (
                        <EditPackageDialog
                          pkg={pkg}
                          triggerLabel="إضافة السعر"
                          triggerClassName="inline-flex h-9 w-full items-center justify-center rounded-md bg-amber-800 px-3 text-xs font-semibold text-amber-50 hover:bg-amber-900"
                        />
                      ) : null}
                    </div>
                  )}
                  <p className="text-xs text-foreground-muted">
                    {pkg.features.length} ميزة
                    {pkg.idealFor ? ` · مناسب لـ: ${pkg.idealFor}` : ""}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap gap-1">
                  {canEdit && priceValid ? (
                    <EditPackageDialog pkg={pkg} />
                  ) : null}
                  {canPublish ? (
                    pkg.status !== ContentStatus.PUBLISHED ? (
                      <RowActionButton
                        id={pkg.id}
                        action={publishPackageAction}
                        label="نشر"
                        variant="primary"
                      />
                    ) : (
                      <RowActionButton
                        id={pkg.id}
                        action={unpublishPackageAction}
                        label="إلى مسودة"
                      />
                    )
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        الصفحة المتقدمة:{" "}
        <Link href="/admin/packages" className="text-primary hover:underline">
          إدارة الباقات
        </Link>
      </p>
    </div>
  );
}
