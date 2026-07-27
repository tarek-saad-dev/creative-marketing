import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ToneBadge } from "@/components/admin/status-badge";
import { listAdminTrustMetrics } from "@/server/services/admin/trust.admin.service";
import {
  CreateTrustMetricDialog,
  EditTrustMetricDialog,
} from "@/components/admin/trust/trust-form-dialogs";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { deleteTrustMetricAction } from "@/server/actions/admin/trust.action";

export const metadata: Metadata = { title: "مؤشرات الثقة" };
export const dynamic = "force-dynamic";

export default async function AdminTrustPage() {
  await requireRole(AdminRole.VIEWER);
  const metrics = await listAdminTrustMetrics();

  return (
    <div>
      <AdminPageHeader
        title="مؤشرات الثقة"
        description="الأرقام والإحصاءات الظاهرة في شريط الثقة بالصفحة الرئيسية"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "مؤشرات الثقة" },
        ]}
        actions={<CreateTrustMetricDialog />}
      />

      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>التسمية</th>
              <th>القيمة</th>
              <th>موثّق</th>
              <th>فعّال</th>
              <th>الترتيب</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {metrics.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد مؤشرات بعد.
                </td>
              </tr>
            ) : (
              metrics.map(metric => (
                <tr key={metric.id}>
                  <td className="font-medium text-foreground">
                    {metric.label}
                  </td>
                  <td dir="ltr">
                    {metric.prefix ?? ""}
                    {metric.value}
                    {metric.suffix ?? ""}
                  </td>
                  <td>
                    <ToneBadge
                      label={metric.isVerified ? "نعم" : "لا"}
                      tone={metric.isVerified ? "success" : "neutral"}
                    />
                  </td>
                  <td>
                    <ToneBadge
                      label={metric.isActive ? "نعم" : "لا"}
                      tone={metric.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td>{metric.displayOrder}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <EditTrustMetricDialog metric={metric} />
                      <DeleteRowButton
                        id={metric.id}
                        action={deleteTrustMetricAction}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
