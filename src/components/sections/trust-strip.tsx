import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
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
    <CinematicSection
      aria-labelledby="trust-heading"
      className="section-space"
      backdropWord="TRUST"
      backdropPosition="start"
    >
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.6fr] lg:items-end lg:gap-16">
        <Reveal>
          <div className="max-w-md space-y-4">
            <p className="font-heading-en text-xs tracking-[0.18em] text-primary uppercase">
              Evidence
            </p>
            <h2
              id="trust-heading"
              className="font-headline text-display-lg text-foreground text-editorial text-balance"
            >
              الشغل هو اللي يتكلم.
            </h2>
            <p className="body-text max-w-md">
              {showMetrics
                ? "أرقام موثّقة من مشاريع حقيقية."
                : "منهجية واضحة عبر أربع قدرات أساسية — بدون أرقام وهمية."}
            </p>
          </div>
        </Reveal>

        <div className="space-y-10">
          {showMetrics ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
              {trustMetrics.map((metric, index) => (
                <li
                  key={metric.id}
                  className={cn(
                    "group card-glow rounded-2xl card-glass p-6 transition-colors hover:border-white/20",
                    index === 0 && "sm:col-span-2 lg:col-span-1"
                  )}
                >
                  <p className="font-headline text-3xl font-bold text-primary sm:text-4xl">
                    {metric.prefix}
                    {metric.value}
                    {metric.suffix}
                  </p>
                  <p className="body-text-muted mt-2">
                    {metric.label}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
              {serviceGroups.map((group, index) => (
                <li
                  key={group.category}
                  className={cn(
                    "card-glow rounded-2xl card-glass p-6",
                    index === 0 && "sm:col-span-2 lg:col-span-1"
                  )}
                >
                  <p className="font-heading-en text-xs font-bold tracking-[0.18em] text-primary">
                    {group.category}
                  </p>
                  <p className="mt-2 font-headline text-xl font-semibold text-foreground">
                    {categoryLabels[group.category]}
                  </p>
                  <p className="body-text-muted mt-2">
                    {group.services.length} خدمات نشطة ضمن هذه المجموعة
                  </p>
                </li>
              ))}
            </ul>
          )}

          {showLogos ? (
            <div>
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
                      className="mx-auto max-h-9 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                      loading="lazy"
                    />
                  );
                  return (
                    <li
                      key={logo.id}
                      className="flex min-h-14 items-center justify-center rounded-xl card-glass px-3 py-3 transition-colors hover:border-white/20"
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
        </div>
      </Container>
    </CinematicSection>
  );
}
