import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole, OfferStatus } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OfferStatusBadge } from "@/components/admin/status-badge";
import { listAdminOffers } from "@/server/services/admin/offer.admin.service";
import { listAdminPackages } from "@/server/services/admin/package.admin.service";
import {
  CreateOfferDialog,
  EditOfferDialog,
} from "@/components/admin/offers/offer-form-dialogs";
import { RowActionButton } from "@/components/admin/row-action-button";
import {
  activateOfferAction,
  disableOfferAction,
} from "@/server/actions/admin/offer.action";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "العروض المحدودة" };
export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  await requireRole(AdminRole.VIEWER);
  const [offers, packages] = await Promise.all([
    listAdminOffers(),
    listAdminPackages(),
  ]);
  const availablePackages = packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    originalPrice: pkg.originalPrice,
  }));

  return (
    <div>
      <AdminPageHeader
        title="العروض المحدودة"
        description="عروض بأسعار خاصة ومحدودة الوقت مرتبطة بالباقات"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "العروض المحدودة" },
        ]}
        actions={<CreateOfferDialog availablePackages={availablePackages} />}
      />

      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>العرض</th>
              <th>الفترة</th>
              <th>الباقات</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد عروض بعد.
                </td>
              </tr>
            ) : (
              offers.map(offer => (
                <tr key={offer.id}>
                  <td>
                    <p className="font-medium text-foreground">{offer.name}</p>
                    <p className="text-xs text-foreground-muted" dir="ltr">
                      /{offer.slug}
                    </p>
                  </td>
                  <td className="text-xs">
                    {formatDateTime(offer.startsAt)} →{" "}
                    {formatDateTime(offer.endsAt)}
                  </td>
                  <td>{offer.offerPackages.length}</td>
                  <td>
                    <OfferStatusBadge status={offer.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <EditOfferDialog
                        offer={offer}
                        availablePackages={availablePackages}
                      />
                      {offer.status !== OfferStatus.ACTIVE &&
                      offer.status !== OfferStatus.SCHEDULED ? (
                        <RowActionButton
                          id={offer.id}
                          action={activateOfferAction}
                          label="تفعيل"
                          variant="primary"
                        />
                      ) : (
                        <RowActionButton
                          id={offer.id}
                          action={disableOfferAction}
                          label="تعطيل"
                        />
                      )}
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
