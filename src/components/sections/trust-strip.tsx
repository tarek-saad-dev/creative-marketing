import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type ServiceGroup = {
  category: "THINK" | "CREATE" | "BUILD" | "GROW";
  services: Array<{ id: string; nameAr: string }>;
};

type TrustMetric = {
  id: string;
  label: string;
  value: string;
  prefix: string | null;
  suffix: string | null;
};

type ClientLogo = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
};

type TrustStripProps = {
  serviceGroups: ServiceGroup[];
  trustMetrics: TrustMetric[];
  clientLogos: ClientLogo[];
};

const categoryLabels: Record<ServiceGroup["category"], string> = {
  THINK: "نفكّر",
  CREATE: "نبدع",
  BUILD: "نبني",
  GROW: "ننمّي",
};

export function TrustStrip({
  serviceGroups,
  trustMetrics,
  clientLogos,
}: TrustStripProps) {
  const showMetrics = trustMetrics.length > 0;
  const showLogos = clientLogos.length > 0;

  return (
    <section
      aria-labelledby="trust-heading"
      className="relative border-y border-border/40 bg-background-elevated/40 section-space"
    >
      <Container className="space-y-10">
        <Reveal>
          <SectionHeading
            id="trust-heading"
            title="الشغل هو اللي يتكلم."
            description={
              showMetrics
                ? "أرقام موثّقة من مشاريع حقيقية."
                : "منهجية واضحة عبر أربع قدرات أساسية — بدون أرقام وهمية."
            }
          />
        </Reveal>

        {showMetrics ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustMetrics.map(metric => (
              <li
                key={metric.id}
                className="rounded-xl border border-border/50 bg-surface-glass p-5 shadow-soft"
              >
                <p className="font-headline text-3xl font-bold text-primary">
                  {metric.prefix}
                  {metric.value}
                  {metric.suffix}
                </p>
                <p className="mt-2 text-sm text-foreground-muted">
                  {metric.label}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serviceGroups.map(group => (
              <li
                key={group.category}
                className="rounded-xl border border-border/50 bg-surface-glass p-5 shadow-soft"
              >
                <p className="font-heading-en text-sm font-bold tracking-[0.16em] text-primary">
                  {group.category}
                </p>
                <p className="mt-2 font-headline text-xl font-semibold text-foreground">
                  {categoryLabels[group.category]}
                </p>
                <p className="mt-2 text-sm text-foreground-muted">
                  {group.services.length} خدمات نشطة ضمن هذه المجموعة
                </p>
              </li>
            ))}
          </ul>
        )}

        {showLogos ? (
          <div className="pt-2">
            <p className="mb-4 text-sm font-semibold text-foreground-muted">
              عملاء نعتز بالعمل معهم
            </p>
            <ul
              className={cn(
                "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4",
                clientLogos.length >= 6 && "md:grid-cols-6"
              )}
            >
              {clientLogos.map(logo => {
                const inner = (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo.logoUrl}
                    alt={logo.name}
                    className="mx-auto max-h-10 w-auto object-contain opacity-90"
                    loading="lazy"
                  />
                );
                return (
                  <li
                    key={logo.id}
                    className="flex min-h-16 items-center justify-center rounded-lg border border-border/40 bg-surface-glass px-3 py-4"
                  >
                    {logo.websiteUrl ? (
                      <a
                        href={logo.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
