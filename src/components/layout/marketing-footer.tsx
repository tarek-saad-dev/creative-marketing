import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { marketingNavItems } from "@/components/layout/nav-config";

type ContactLink = {
  label: string;
  href: string;
  external?: boolean;
};

type MarketingFooterProps = {
  brandName: string;
  slogan: string;
  contactLinks: ContactLink[];
  socialLinks: ContactLink[];
};

export function MarketingFooter({
  brandName,
  slogan,
  contactLinks,
  socialLinks,
}: MarketingFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/30 bg-background-deep/60">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-strong/40 to-transparent"
        aria-hidden="true"
      />
      <Container className="section-space grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <BrandLogo />
          <p className="font-heading-en text-xs tracking-[0.14em] text-foreground-muted uppercase">
            {slogan}
          </p>
          <p className="max-w-sm text-sm leading-7 text-foreground-muted">
            {brandName} — استراتيجية، محتوى، تصميم، ونمو يخلي مشروعك يبان بثقة.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">استكشف</p>
          <nav aria-label="روابط التذييل" className="flex flex-col gap-2">
            {marketingNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-foreground-muted transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="#contact"
              className="text-sm text-foreground-muted transition-colors hover:text-primary"
            >
              تواصل
            </Link>
          </nav>
        </div>

        <div className="space-y-6">
          {contactLinks.length > 0 ? (
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">
                تواصل
              </p>
              <ul className="space-y-2">
                {contactLinks.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-foreground-muted transition-colors hover:text-primary"
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {socialLinks.length > 0 ? (
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">
                حساباتنا
              </p>
              <ul className="flex flex-wrap gap-3">
                {socialLinks.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Container>

      <div className="border-t border-border/40">
        <Container className="flex flex-col gap-2 py-5 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brandName}. جميع الحقوق محفوظة.
          </p>
          <p className="font-heading-en tracking-wide">
            WE THINK. WE CREATE. YOU GROW.
          </p>
        </Container>
      </div>
    </footer>
  );
}
