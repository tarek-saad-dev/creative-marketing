import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ToneBadge } from "@/components/admin/status-badge";
import { listAdminClientLogos } from "@/server/services/admin/trust.admin.service";
import {
  CreateClientLogoDialog,
  EditClientLogoDialog,
} from "@/components/admin/trust/trust-form-dialogs";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { deleteClientLogoAction } from "@/server/actions/admin/trust.action";

export const metadata: Metadata = { title: "شعارات العملاء" };
export const dynamic = "force-dynamic";

export default async function AdminClientLogosPage() {
  await requireRole(AdminRole.VIEWER);
  const logos = await listAdminClientLogos();

  return (
    <div>
      <AdminPageHeader
        title="شعارات العملاء"
        description="الشعارات الظاهرة ضمن شريط عملاء الوكالة"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "شعارات العملاء" },
        ]}
        actions={<CreateClientLogoDialog />}
      />

      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>الشعار</th>
              <th>الاسم</th>
              <th>فعّال</th>
              <th>الترتيب</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {logos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد شعارات بعد.
                </td>
              </tr>
            ) : (
              logos.map(logo => (
                <tr key={logo.id}>
                  <td>
                    <div className="flex h-10 w-16 items-center justify-center rounded-md border border-border bg-white p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview thumbnail of arbitrary external URLs */}
                      <img
                        src={logo.logoUrl}
                        alt={logo.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </td>
                  <td className="font-medium text-foreground">{logo.name}</td>
                  <td>
                    <ToneBadge
                      label={logo.isActive ? "نعم" : "لا"}
                      tone={logo.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td>{logo.displayOrder}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <EditClientLogoDialog logo={logo} />
                      <DeleteRowButton
                        id={logo.id}
                        action={deleteClientLogoAction}
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
