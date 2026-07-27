import { Container } from "@/components/ui/container";
import { BrandButton } from "@/components/ui/brand-button";
import { OfferCountdown } from "@/components/sections/commercial/offer-countdown";
import { OfferPriceBlock } from "@/components/ui/price-display";
import { LeadOpenButton } from "@/components/lead/lead-open-button";
import type { PublicOfferView } from "@/server/services/commercial-landing.service";

type LimitedOfferSectionProps = {
  offer: PublicOfferView | null;
};

export function LimitedOfferSection({ offer }: LimitedOfferSectionProps) {
  if (!offer) return null;

  if (offer.computedStatus === "upcoming") {
    return (
      <section
        aria-labelledby="offer-heading"
        className="scroll-mt-nav border-y border-border/20 bg-surface-light py-14 text-brand-navy"
      >
        <Container className="max-w-3xl space-y-3 text-center">
          <p className="font-heading-en text-xs tracking-[0.2em] text-brand-indigo/60">
            LIMITED OFFER
          </p>
          <h2
            id="offer-heading"
            className="font-headline text-2xl font-semibold sm:text-3xl"
          >
            عرض جديد يبدأ قريبًا.
          </h2>
          <p className="text-sm leading-7 text-brand-navy/75 sm:text-base">
            {offer.headline}
          </p>
          <p className="text-sm text-brand-navy/70">
            الأسعار المخفّضة تظهر عند بداية العرض فقط.
          </p>
        </Container>
      </section>
    );
  }

  if (offer.computedStatus === "full") {
    return (
      <section
        aria-labelledby="offer-heading"
        className="scroll-mt-nav border-y border-border/20 bg-surface-light py-14 text-brand-navy"
      >
        <Container className="max-w-3xl space-y-4 text-center">
          <h2
            id="offer-heading"
            className="font-headline text-2xl font-semibold sm:text-3xl"
          >
            اكتمل عدد المشاريع المتاحة بهذا العرض.
          </h2>
          <p className="text-sm leading-7 text-brand-navy/75">
            يمكنك اختيار الباكدجات بالأسعار الأساسية أو إرسال طلب مخصص.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <BrandButton href="#packages" variant="secondary">
              راجع الباكدجات
            </BrandButton>
            <LeadOpenButton source="offer_full" variant="primary">
              ابدأ طلبًا مخصصًا
            </LeadOpenButton>
          </div>
        </Container>
      </section>
    );
  }

  if (offer.computedStatus !== "active") return null;

  const primary = offer.packages[0] ?? null;

  return (
    <section
      aria-labelledby="offer-heading"
      className="scroll-mt-nav border-y border-border/20 bg-[linear-gradient(180deg,#F8FAFC_0%,#E8FFF9_100%)] py-14 text-brand-navy sm:py-16"
    >
      <Container className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-4">
          <p className="font-heading-en text-xs tracking-[0.2em] text-brand-indigo/55">
            {offer.name}
          </p>
          <h2
            id="offer-heading"
            className="font-headline text-display-md text-balance"
          >
            ابدأ بمستوى احترافي قبل انتهاء عرض الإطلاق.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-brand-navy/80 sm:text-base">
            أسعار خاصة لعدد محدد من المشاريع، مع نفس مستوى التنفيذ والمتابعة في
            الباكدجات الأساسية.
          </p>
          <p className="text-base font-semibold text-brand-navy">
            {offer.headline}
          </p>
          {offer.description ? (
            <p className="text-sm leading-7 text-brand-navy/75">
              {offer.description}
            </p>
          ) : null}

          {offer.remainingSlots !== null ? (
            <p className="text-sm font-medium text-brand-violet">
              المتبقي: {offer.remainingSlots} من {offer.maxSlots} مشاريع
            </p>
          ) : null}

          <OfferCountdown endsAtIso={offer.endsAt} />

          <LeadOpenButton
            source="offer_active"
            variant="primary"
            className="mt-2"
          >
            احجز العرض
          </LeadOpenButton>
        </div>

        {primary ? (
          <div className="rounded-2xl border border-brand-indigo/10 bg-white p-6 shadow-card">
            <p className="text-sm text-brand-navy/70">{primary.packageName}</p>
            <div className="mt-3">
              <OfferPriceBlock
                originalPrice={primary.originalPrice}
                offerPrice={primary.offerPrice}
                currency="SAR"
                savingAmount={primary.savingAmount}
              />
            </div>
            <BrandButton href="#packages" variant="secondary" className="mt-5">
              قارن الباكدجات
            </BrandButton>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
