import { BrandButton } from "@/components/ui/brand-button";

type WorkEmptyStateProps = {
  isDevelopment?: boolean;
};

export function WorkEmptyState({ isDevelopment = false }: WorkEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface-glass p-8 shadow-card sm:p-10">
      <div
        className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-brand-violet/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -start-10 bottom-0 h-40 w-40 rounded-full bg-brand-aqua/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-4">
          <p className="font-headline text-xl font-semibold text-foreground sm:text-2xl text-balance">
            نجهّز حاليًا دراسات أعمالنا بالتفاصيل التي توضّح الفكرة، التنفيذ،
            والنتيجة.
          </p>
          <p className="max-w-xl text-sm leading-7 text-foreground-muted sm:text-base">
            جدار الأعمال سيعرض مشاريع منشورة كاملة فقط — بدون نتائج مفبركة أو
            صور عشوائية. إلى ذلك الحين، يمكنك استكشاف منظومة الخدمات أو بدء حديث
            عن مشروعك.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <BrandButton href="#services" variant="primary">
              استكشف الخدمات
            </BrandButton>
            <BrandButton href="#contact" variant="secondary">
              تواصل معنا
            </BrandButton>
          </div>
          {isDevelopment ? (
            <p className="pt-2 text-xs text-foreground-muted/80">
              Dev: لا توجد مشاريع منشورة مكتملة في قاعدة التطوير.
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3" aria-hidden="true">
          {["THINK", "CREATE", "BUILD", "GROW"].map(label => (
            <div
              key={label}
              className="flex aspect-[4/3] items-end rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-3"
            >
              <span className="font-heading-en text-sm tracking-[0.2em] text-white/35">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
