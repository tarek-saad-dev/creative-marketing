"use client";

import { useEffect } from "react";
import { BrandButton } from "@/components/ui/brand-button";
import { Container } from "@/components/ui/container";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Marketing route error:", error.digest ?? error.name);
  }, [error]);

  return (
    <div className="section-space pt-nav" role="alert">
      <Container className="flex max-w-xl flex-col items-start gap-4">
        <h1 className="font-headline text-2xl font-bold text-foreground">
          تعذر تحميل الصفحة
        </h1>
        <p className="text-foreground-muted">
          حدث خطأ غير متوقع. حاول مرة أخرى خلال لحظات.
        </p>
        <BrandButton type="button" onClick={reset}>
          إعادة المحاولة
        </BrandButton>
      </Container>
    </div>
  );
}
