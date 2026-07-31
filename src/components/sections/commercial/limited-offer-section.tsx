import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
import { AmbientGlow } from "@/components/ui/ambient-glow";
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
      <CinematicSection
        aria-labelledby="offer-heading"
        className="scroll-mt-nav section-space"
        backdropWord="OFFER"
        backdropPosition="end"
      >
        <Container className="relative z-10 max-w-3xl space-y-4 text-center">
          <p className="font-heading-en text-xs tracking-[0.18em] text-primary uppercase">
            LIMITED OFFER
          </p>
          <h2
            id="offer-heading"
            className="font-headline text-display-md font-semibold text-foreground text-editorial"
          >
            عرض جديد يبدأ قريبًا.
          </h2>
          <p className="body-text">{offer.headline}</p>
          <p className="body-text-muted">
            الأسعار المخفّضة تظهر عند بداية العرض فقط.
          </p>
        </Container>
      </CinematicSection>
    );
  }

  if (offer.computedStatus === "full") {
    return (
      <CinematicSection
        aria-labelledby="offer-heading"
        className="scroll-mt-nav section-space"
        backdropWord="OFFER"
        backdropPosition="end"
      >
        <Container className="relative z-10 max-w-3xl space-y-4 text-center">
          <p className="font-heading-en text-xs tracking-[0.18em] text-primary uppercase">
            LIMITED OFFER
          </p>
          <h2
            id="offer-heading"
            className="font-headline text-display-md font-semibold text-foreground text-editorial"
          >
            اكتمل عدد المشاريع المتاحة بهذا العرض.
          </h2>
          <p className="body-text">
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
      </CinematicSection>
    );
  }

  if (offer.computedStatus !== "active") return null;

  const primary = offer.packages[0] ?? null;

  return (
    <CinematicSection
      aria-labelledby="offer-heading"
      className="scroll-mt-nav section-space"
      backdropWord="OFFER"
      backdropPosition="end"
    >
      <Container className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <AmbientGlow position="top-right" tone="aqua" size="lg" />
        <div className="space-y-4">
          <p className="font-heading-en text-xs tracking-[0.18em] text-primary uppercase">
            {offer.name}
          </p>
          <h2
            id="offer-heading"
            className="font-headline text-display-md text-foreground text-editorial text-balance"
          >
            ابدأ بمستوى احترافي قبل انتهاء عرض الإطلاق.
          </h2>
          <p className="body-text max-w-xl">
            أسعار خاصة لعدد محدد من المشاريع، مع نفس مستوى التنفيذ والمتابعة في
            الباكدجات الأساسية.
          </p>
          <p className="text-base font-semibold text-foreground">
            {offer.headline}
          </p>
          {offer.description ? (
            <p className="body-text">{offer.description}</p>
          ) : null}

          {offer.remainingSlots !== null ? (
            <p className="text-sm font-medium text-primary">
              المتبقي: {offer.remainingSlots} من {offer.maxSlots} مشاريع
            </p>
          ) : null}

          <OfferCountdown endsAtIso={offer.endsAt} variant="onDark" />

          <LeadOpenButton
            source="offer_active"
            variant="primary"
            className="mt-2"
          >
            احجز العرض
          </LeadOpenButton>
        </div>

        {primary ? (
          <div className="card-glow relative rounded-2xl card-glass p-6">
            <p className="body-text-muted">{primary.packageName}</p>
            <div className="mt-3">
              <OfferPriceBlock
                originalPrice={primary.originalPrice}
                offerPrice={primary.offerPrice}
                currency="SAR"
                savingAmount={primary.savingAmount}
                variant="onDark"
              />
            </div>
            <BrandButton href="#packages" variant="secondary" className="mt-5">
              قارن الباكدجات
            </BrandButton>
          </div>
        ) : null}
      </Container>
    </CinematicSection>
  );
}
