import { Spinner } from "@/components/ui/spinner";
import { Container } from "@/components/ui/container";

export default function MarketingLoading() {
  return (
    <div
      className="section-space pt-nav"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Container className="flex max-w-3xl flex-col items-center justify-center gap-4 py-24">
        <Spinner size="lg" className="text-primary" />
        <p className="text-sm text-foreground-muted">جاري تحميل الصفحة…</p>
      </Container>
    </div>
  );
}
