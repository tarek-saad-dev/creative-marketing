import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfferPriceBlock } from "@/components/ui/price-display";
import { LeadOpenButton } from "@/components/lead/lead-open-button";
import type { PublicPackageCard } from "@/server/services/commercial-landing.service";

type PackageCardProps = {
  pkg: PublicPackageCard;
};

export function PackageCard({ pkg }: PackageCardProps) {
  const included = pkg.features.filter(f => f.included);
  const excluded = pkg.features.filter(f => !f.included);

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-6 shadow-card",
        pkg.isFeatured
          ? "border-brand-aqua/40 bg-surface-glass lg:-translate-y-2"
          : "border-border/40 bg-background-elevated/50"
      )}
    >
      {pkg.isFeatured ? (
        <p className="absolute -top-3 start-6 rounded-full bg-brand-aqua px-3 py-1 text-xs font-bold text-brand-navy">
          الأكثر طلبًا
        </p>
      ) : null}

      <header className="space-y-2">
        <h3 className="font-headline text-2xl font-semibold text-foreground">
          {pkg.name}
        </h3>
        {pkg.tagline ? (
          <p className="text-sm text-brand-aqua">{pkg.tagline}</p>
        ) : null}
        <p className="text-sm leading-7 text-foreground-muted">
          مناسب لـ: {pkg.idealFor}
        </p>
        <p className="text-sm leading-7 text-foreground-muted">
          {pkg.description}
        </p>
      </header>

      <div className="mt-5">
        <OfferPriceBlock
          originalPrice={pkg.originalPrice}
          offerPrice={pkg.offerPrice}
          currency={pkg.currency}
          savingAmount={pkg.savingAmount}
        />
        {pkg.billingPeriod ? (
          <p className="mt-1 text-xs text-foreground-muted">
            {pkg.billingPeriod}
          </p>
        ) : null}
      </div>

      <dl className="mt-4 space-y-1 text-sm text-foreground-muted">
        {pkg.startTimeText ? (
          <div>
            <dt className="inline">بداية متوقعة: </dt>
            <dd className="inline text-foreground">{pkg.startTimeText}</dd>
          </div>
        ) : null}
        {pkg.revisionCount != null ? (
          <div>
            <dt className="inline">المراجعات: </dt>
            <dd className="inline text-foreground">{pkg.revisionCount}</dd>
          </div>
        ) : null}
      </dl>

      <ul className="mt-5 space-y-2" aria-label={`مميزات ${pkg.name}`}>
        {included.map(feature => (
          <li key={feature.id} className="flex gap-2 text-sm text-foreground">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-aqua"
              aria-hidden="true"
            />
            <span>
              <span className="sr-only">مشمول: </span>
              {feature.title}
            </span>
          </li>
        ))}
        {excluded.map(feature => (
          <li
            key={feature.id}
            className="flex gap-2 text-sm text-foreground-muted"
          >
            <X
              className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted"
              aria-hidden="true"
            />
            <span>
              <span className="sr-only">غير مشمول: </span>
              {feature.title}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-foreground-muted">
        لا توجد مصاريف مخفية.
      </p>

      <LeadOpenButton
        source="package_card"
        packageId={pkg.id}
        className="mt-auto pt-6"
        variant={pkg.isFeatured ? "primary" : "secondary"}
      >
        اختر {pkg.name}
      </LeadOpenButton>
    </article>
  );
}
