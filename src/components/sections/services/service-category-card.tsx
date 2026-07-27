import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { canUseNextImage } from "@/lib/media/public-media";
import type { ServiceCategoryEcosystem } from "@/server/services/project.service";

type ServiceCategoryCardProps = {
  group: ServiceCategoryEcosystem;
  index: number;
};

export function ServiceCategoryCard({
  group,
  index,
}: ServiceCategoryCardProps) {
  const lightSurface = index % 2 === 1;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 shadow-card sm:p-7",
        lightSurface
          ? "border-border/30 bg-surface-light text-brand-navy"
          : "border-border/40 bg-surface-glass text-foreground",
        "lg:-rotate-0 lg:transition-transform lg:duration-300 lg:hover:-translate-y-1 motion-reduce:transform-none"
      )}
    >
      <p
        className={cn(
          "pointer-events-none absolute -end-2 top-2 font-headline text-6xl font-bold tracking-normal select-none sm:text-7xl",
          lightSurface ? "text-brand-indigo/10" : "text-white/10"
        )}
        aria-hidden="true"
      >
        {group.labelEn}
      </p>

      <div className="relative space-y-5">
        <header className="space-y-2">
          <p
            className={cn(
              "font-heading-en text-xs tracking-[0.22em]",
              lightSurface ? "text-brand-indigo/70" : "text-brand-aqua"
            )}
          >
            {group.labelEn}
          </p>
          <h3
            className={cn(
              "font-headline text-xl font-semibold text-balance sm:text-2xl",
              lightSurface ? "text-brand-navy" : "text-foreground"
            )}
          >
            {group.titleAr}
          </h3>
          <p
            className={cn(
              "text-sm leading-7",
              lightSurface
                ? "text-brand-navy opacity-80"
                : "text-foreground-muted"
            )}
          >
            {group.descriptionAr}
          </p>
        </header>

        <ul className="space-y-2.5" aria-label={`خدمات ${group.labelEn}`}>
          {group.services.map(service => (
            <li key={service.id} className="flex gap-2 text-sm leading-6">
              <span
                className={cn(
                  "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                  lightSurface ? "bg-brand-violet" : "bg-brand-aqua"
                )}
                aria-hidden="true"
              />
              <span>
                <span
                  className={cn(
                    "font-medium",
                    lightSurface ? "text-brand-navy" : "text-foreground"
                  )}
                >
                  {service.nameAr}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs leading-5",
                    lightSurface
                      ? "text-brand-navy opacity-70"
                      : "text-foreground-muted"
                  )}
                >
                  {service.summaryAr}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {group.projectPreview ? (
          <div className="pt-1">
            <p
              className={cn(
                "mb-2 text-xs font-medium",
                lightSurface
                  ? "text-brand-navy opacity-70"
                  : "text-foreground-muted"
              )}
            >
              عمل مرتبط
            </p>
            <Link
              href={`/work/${group.projectPreview.slug}`}
              className={cn(
                "group/preview flex items-center gap-3 rounded-xl border p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                lightSurface
                  ? "border-brand-indigo/15 bg-white/70 hover:bg-white"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                {canUseNextImage(group.projectPreview.coverImageUrl) ? (
                  <Image
                    src={group.projectPreview.coverImageUrl}
                    alt={group.projectPreview.coverImageAlt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={group.projectPreview.coverImageUrl}
                    alt={group.projectPreview.coverImageAlt}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-sm font-semibold",
                    lightSurface ? "text-brand-navy" : "text-foreground"
                  )}
                >
                  {group.projectPreview.title}
                </p>
                <p className="text-xs text-primary">عرض الدراسة</p>
              </div>
            </Link>
          </div>
        ) : (
          <div
            className={cn(
              "mt-1 rounded-xl border border-dashed p-4",
              lightSurface
                ? "border-brand-indigo/20 bg-brand-indigo/5"
                : "border-white/15 bg-white/5"
            )}
            aria-hidden="true"
          >
            <p
              className={cn(
                "font-heading-en text-sm tracking-[0.2em]",
                lightSurface ? "text-brand-indigo/40" : "text-white/35"
              )}
            >
              {group.labelEn}
            </p>
            <div className="mt-3 flex gap-2">
              <span className="h-8 w-8 rounded-md bg-brand-aqua/30" />
              <span className="h-8 w-14 rounded-md bg-brand-violet/30" />
              <span className="h-8 flex-1 rounded-md bg-white/10" />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
