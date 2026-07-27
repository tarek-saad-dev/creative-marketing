import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  href?: string;
  priority?: boolean;
};

/**
 * Temporary wordmark/monogram until official logo assets land in /public/brand/.
 * Interface is ready for next/image once logo.svg / logo-wordmark.svg exist.
 */
export function BrandLogo({ className, href = "/" }: BrandLogoProps) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-cta)] text-sm font-bold text-primary-foreground shadow-soft"
      >
        CM
      </span>
      <span className="font-headline text-base font-bold tracking-normal text-foreground sm:text-lg">
        Creative Marketing
      </span>
    </span>
  );

  return (
    <Link
      href={href}
      className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Creative Marketing — الصفحة الرئيسية"
    >
      {mark}
    </Link>
  );
}
