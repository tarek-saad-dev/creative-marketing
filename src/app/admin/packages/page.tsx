import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole, ContentStatus } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusBadge, ToneBadge } from "@/components/admin/status-badge";
import { listAdminPackages } from "@/server/services/admin/package.admin.service";
import {
  CreatePackageDialog,
  EditPackageDialog,
} from "@/components/admin/packages/package-form-dialogs";
import { RowActionButton } from "@/components/admin/row-action-button";
import {
  archivePackageAction,
  publishPackageAction,
  softDeletePackageAction,
  unpublishPackageAction,
} from "@/server/actions/admin/package.action";
import { hasValidConfiguredPrice } from "@/lib/validation/pricing";
import { decimalToPublicString } from "@/lib/validation/decimal-price";

export const metadata: Metadata = { title: "الباقات" };
export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  await requireRole(AdminRole.VIEWER);
  const packages = await listAdminPackages();

  return (
    <div>
      <AdminPageHeader
        title="الباقات"
        description="باقات الأسعار الظاهرة في قسم التسعير بالصفحة الرئيسية"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الباقات" },
        ]}
        actions={<CreatePackageDialog />}
      />

      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>الباقة</th>
              <th>السعر</th>
              <th>الميزات</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد باقات بعد.
                </td>
              </tr>
            ) : (
              packages.map(pkg => {
                const priceValid = hasValidConfiguredPrice(pkg.originalPrice);
                return (
                  <tr key={pkg.id}>
                    <td>
                      <p className="font-medium text-foreground">{pkg.name}</p>
                      <p className="text-xs text-foreground-muted" dir="ltr">
                        /{pkg.slug}
                      </p>
                    </td>
                    <td dir="ltr">
                      {priceValid ? (
                        `${decimalToPublicString(pkg.originalPrice)} ${pkg.currency}`
                      ) : (
                        <ToneBadge label="بدون سعر" tone="warning" />
                      )}
                    </td>
                    <td>{pkg.features.length}</td>
                    <td>
                      <ContentStatusBadge status={pkg.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <EditPackageDialog pkg={pkg} />
                        {pkg.status !== ContentStatus.PUBLISHED ? (
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
                        )}
                        <RowActionButton
                          id={pkg.id}
                          action={archivePackageAction}
                          label="أرشفة"
                        />
                        <RowActionButton
                          id={pkg.id}
                          action={softDeletePackageAction}
                          label="حذف"
                          variant="danger"
                          confirmMessage="حذف هذه الباقة؟"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
