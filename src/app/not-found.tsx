import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { BrandButton } from "@/components/ui/brand-button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/50 py-5">
        <Container>
          <BrandLogo />
        </Container>
      </header>
      <main className="section-space flex-1">
        <Container className="flex max-w-xl flex-col items-start gap-4">
          <p className="text-sm font-semibold tracking-wide text-primary">
            404
          </p>
          <h1 className="font-headline text-3xl font-bold text-foreground">
            الصفحة غير موجودة
          </h1>
          <p className="text-foreground-muted">
            الرابط الذي حاولت فتحه غير متاح أو تم نقله.
          </p>
          <BrandButton href="/">العودة للرئيسية</BrandButton>
        </Container>
      </main>
      <footer className="border-t border-border/40 py-6">
        <Container>
          <Link
            href="/"
            className="text-sm text-foreground-muted hover:text-primary"
          >
            Creative Marketing
          </Link>
        </Container>
      </footer>
    </div>
  );
}
