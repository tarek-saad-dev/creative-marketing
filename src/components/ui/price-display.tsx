import { cn } from "@/lib/utils";

type PriceDisplayProps = {
  amount: string;
  currency: string;
  locale?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  struck?: boolean;
  variant?: "default" | "onDark";
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
  variant = "default",
}: PriceDisplayProps) {
  const formatted = formatAmount(amount, currency, locale);
  if (!formatted) return null;

  const colorClass =
    variant === "onDark"
      ? "text-foreground"
      : struck
        ? "text-brand-navy/55"
        : "text-brand-navy";

  return (
    <span
      className={cn(
        "inline-flex flex-col",
        size === "lg" && "text-3xl font-bold",
        size === "md" && "text-2xl font-bold",
        size === "sm" && "text-base font-semibold",
        struck && "line-through decoration-2",
        colorClass,
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
  variant?: "default" | "onDark";
};

export function OfferPriceBlock({
  originalPrice,
  offerPrice,
  currency,
  savingAmount,
  variant = "default",
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
          variant={variant}
        />
        <PriceDisplay
          amount={offerPrice}
          currency={currency}
          size="lg"
          label="سعر العرض"
          variant={variant}
        />
        {savingAmount ? (
          <p
            className={cn(
              "text-sm font-medium",
              variant === "onDark" ? "text-primary" : "text-brand-violet"
            )}
          >
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
      variant={variant}
    />
  );
}
