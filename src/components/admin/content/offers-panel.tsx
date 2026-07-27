import Link from "next/link";
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
import { EffectiveOfferStatusBadge } from "@/components/admin/status-badge";
import { resolvePublicOfferStatus } from "@/lib/offers/offer-status";
import { formatDateTime } from "@/lib/utils";
import { ViewerReadonlyBanner } from "@/components/admin/content/content-helpers";

export async function OffersPanel({ canEdit }: { canEdit: boolean }) {
  const [offers, packages] = await Promise.all([
    listAdminOffers(),
    listAdminPackages(),
  ]);
  const availablePackages = packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    originalPrice: pkg.originalPrice,
  }));
  const now = new Date();

  return (
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            العروض
          </h2>
          <p className="text-sm text-foreground-muted">
            عروض بأسعار خاصة ومحدودة الوقت — الحالة تظهر بلغة واضحة.
          </p>
        </div>
        {canEdit ? (
          <CreateOfferDialog availablePackages={availablePackages} />
        ) : null}
      </div>

      {offers.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-foreground-muted">
          لا يوجد عرض حالي.
          {canEdit ? (
            <p className="mt-2">أنشئ عرضًا جديدًا عند جاهزية الأسعار.</p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map(offer => {
            const eligible = offer.offerPackages?.length ?? 0;
            const effective = resolvePublicOfferStatus(offer, eligible, now);
            return (
              <article key={offer.id} className="admin-card space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {offer.headline || offer.name}
                    </h3>
                    <p className="text-xs text-foreground-muted">
                      {offer.name}
                    </p>
                  </div>
                  <EffectiveOfferStatusBadge status={effective} />
                </div>
                <p className="text-xs text-foreground-muted">
                  من {formatDateTime(offer.startsAt)} إلى{" "}
                  {formatDateTime(offer.endsAt)}
                </p>
                <p className="text-xs text-foreground-muted">
                  {eligible} باكدج مرتبطة
                  {offer.maxSlots != null
                    ? ` · المقاعد ${offer.bookedSlots}/${offer.maxSlots}`
                    : " · بدون حد مقاعد"}
                </p>
                {canEdit ? (
                  <div className="flex flex-wrap gap-1">
                    <EditOfferDialog
                      offer={offer}
                      availablePackages={availablePackages}
                    />
                    <RowActionButton
                      id={offer.id}
                      action={activateOfferAction}
                      label="تشغيل"
                      variant="primary"
                    />
                    <RowActionButton
                      id={offer.id}
                      action={disableOfferAction}
                      label="إيقاف"
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        الصفحة المتقدمة:{" "}
        <Link href="/admin/offers" className="text-primary hover:underline">
          إدارة العروض
        </Link>
      </p>
    </div>
  );
}
