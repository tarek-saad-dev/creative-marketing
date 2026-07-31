import { Reveal } from "@/components/motion/reveal";

/**
 * Narrative bridge: prove the work → explain the system behind it.
 * No scroll hijacking.
 */
export function WorkToServicesBridge() {
  return (
    <Reveal delay={0.08}>
      <div className="card-glow relative overflow-hidden rounded-2xl card-glass px-5 py-6 sm:px-8 sm:py-8">
        <p className="font-heading-en text-[11px] tracking-[0.28em] text-white/40 uppercase">
          We prove the work → We explain the system
        </p>
        <div
          className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3"
          aria-hidden="true"
        >
          {["THINK", "CREATE", "BUILD", "GROW"].map((label, index) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 sm:gap-3"
            >
              {index > 0 ? (
                <span className="h-px w-4 bg-border-strong/60 sm:w-8" />
              ) : null}
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-heading-en text-xs tracking-[0.18em] text-foreground/80">
                {label}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-4 max-w-xl text-sm leading-7 text-foreground-muted">
          خلف كل نتيجة منظومة خدمات مترابطة — من التفكير إلى النمو المستمر.
        </p>
        <a
          href="#services"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          انتقل إلى منظومة الخدمات
        </a>
      </div>
    </Reveal>
  );
}
