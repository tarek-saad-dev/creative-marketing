import Link from "next/link";

export default function WorkProjectNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-lg space-y-4 text-center">
        <h1 className="font-headline text-2xl font-semibold text-foreground sm:text-3xl">
          المشروع غير متاح
        </h1>
        <p className="text-sm leading-7 text-foreground-muted sm:text-base">
          قد يكون المشروع غير منشور، أو الرابط غير صحيح، أو تمت إزالته.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/#work"
            className="inline-flex min-h-11 items-center justify-center rounded-pill bg-[image:var(--gradient-cta)] px-6 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            العودة إلى الأعمال
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-strong px-6 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
