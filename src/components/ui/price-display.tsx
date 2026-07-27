import { cn } from "@/lib/utils";

type PriceDisplayProps = {
  amount: string;
  currency: string;
  locale?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  struck?: boolean;
};

function formatAmount(
  amount: string,
  currency: string,
  locale: string
): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "SAR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function PriceDisplay({
  amount,
  currency,
  locale = "ar-EG",
  className,
  size = "md",
  label,
  struck = false,
}: PriceDisplayProps) {
  const formatted = formatAmount(amount, currency, locale);
  if (!formatted) return null;

  return (
    <span
      className={cn(
        "inline-flex flex-col",
        size === "lg" && "text-3xl font-bold",
        size === "md" && "text-2xl font-bold",
        size === "sm" && "text-base font-semibold",
        struck && "text-brand-navy/55 line-through decoration-2",
        !struck && "text-brand-navy",
        className
      )}
    >
      {label ? <span className="sr-only">{label}</span> : null}
      <span aria-hidden={Boolean(label)}>{formatted}</span>
    </span>
  );
}

type OfferPriceBlockProps = {
  originalPrice: string;
  offerPrice: string | null;
  currency: string;
  savingAmount: string | null;
};

export function OfferPriceBlock({
  originalPrice,
  offerPrice,
  currency,
  savingAmount,
}: OfferPriceBlockProps) {
  if (offerPrice) {
    return (
      <div className="space-y-1">
        <PriceDisplay
          amount={originalPrice}
          currency={currency}
          size="sm"
          struck
          label="السعر الأصلي"
        />
        <PriceDisplay
          amount={offerPrice}
          currency={currency}
          size="lg"
          label="سعر العرض"
        />
        {savingAmount ? (
          <p className="text-sm font-medium text-brand-violet">
            توفير {savingAmount} {currency}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <PriceDisplay
      amount={originalPrice}
      currency={currency}
      size="lg"
      label="السعر"
    />
  );
}
