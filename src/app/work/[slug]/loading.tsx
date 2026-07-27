export default function WorkProjectLoading() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true">
      <div className="border-b border-border/30">
        <div className="container-brand py-16 sm:py-20">
          <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-6 h-10 w-3/4 max-w-xl animate-pulse rounded bg-white/10" />
          <div className="mt-4 h-20 max-w-2xl animate-pulse rounded bg-white/5" />
          <div className="mt-8 aspect-[16/10] max-w-5xl animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
      <div className="container-brand space-y-6 py-14">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="h-24 max-w-3xl animate-pulse rounded bg-white/5" />
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-24 max-w-3xl animate-pulse rounded bg-white/5" />
      </div>
      <span className="sr-only">جاري تحميل دراسة المشروع…</span>
    </div>
  );
}
