import {isValidPublicOfferPrice} from "@/lib/validation/pricing";
import {calculateSavingPercent,decimalToPublicString} from "@/lib/validation/decimal-price";
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

export async function OffersPanel({ canEdit,editId,newOffer=false }: { canEdit: boolean;editId?:string;newOffer?:boolean }) {
  const [offers, packages] = await Promise.all([
    listAdminOffers(),
    listAdminPackages(),
  ]);
  const availablePackages = packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    originalPrice: pkg.originalPrice?.toString()??null,
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
          <CreateOfferDialog availablePackages={availablePackages} initialOpen={newOffer&&!editId} />
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
            const eligible = offer.offerPackages.filter(row=>!row.package.deletedAt&&row.package.status==="PUBLISHED"&&isValidPublicOfferPrice(row.offerPrice,row.package.originalPrice)).length;
            const model={...offer,offerPackages:offer.offerPackages.map(row=>({...row,offerPrice:row.offerPrice.toString(),package:{...row.package,originalPrice:row.package.originalPrice?.toString()??null}}))};
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
                  {eligible} من {offer.offerPackages.length} باقة مؤهلة
                  {offer.maxSlots != null
                    ? ` · المقاعد ${offer.bookedSlots}/${offer.maxSlots}`
                    : " · بدون حد مقاعد"}
                </p>
                <div className="space-y-2 border-t border-border pt-3">{offer.offerPackages.map(row=>{const original=decimalToPublicString(row.package.originalPrice);const discount=decimalToPublicString(row.offerPrice);const valid=!row.package.deletedAt&&row.package.status==="PUBLISHED"&&isValidPublicOfferPrice(row.offerPrice,row.package.originalPrice);const saving=original&&discount?calculateSavingPercent(original,discount):null;return <div key={row.packageId} className="flex flex-wrap justify-between gap-2 text-xs"><span>{row.package.name}</span><span dir="ltr">{original??"—"} → {discount??"—"} {saving!==null?"("+saving+"%)":""}</span>{!valid&&<span className="text-amber-800">غير مؤهلة للنشر</span>}</div>})}</div>
                {canEdit ? (
                  <div className="flex flex-wrap gap-1">
                    <EditOfferDialog
                      offer={model} initialOpen={editId===offer.id}
                      availablePackages={availablePackages}
                    />
                    <RowActionButton
                      id={offer.id}
                      action={activateOfferAction}
                      label="تشغيل" disabled={eligible===0||offer.endsAt<now} confirmMessage="تفعيل العرض؟"
                      variant="primary"
                    />
                    <RowActionButton
                      id={offer.id}
                      action={disableOfferAction}
                      label="إيقاف" confirmMessage="إيقاف العرض؟"
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
