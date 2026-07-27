import { cn } from "@/lib/utils";

type PhoneMockupProps = {
  className?: string;
  brandName: string;
};

/**
 * CSS smartphone mockup — no copyrighted network logos, no fake metrics.
 */
export function PhoneMockup({ className, brandName }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[min(100%,17.5rem)] select-none",
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute -inset-6 rounded-[2.5rem] bg-brand-cyan/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[#0f1224] p-2 shadow-floating">
        <div className="absolute start-0 top-[28%] h-8 w-[3px] rounded-e-sm bg-white/20" />
        <div className="absolute end-0 top-[24%] h-12 w-[3px] rounded-s-sm bg-white/15" />
        <div className="absolute end-0 top-[38%] h-12 w-[3px] rounded-s-sm bg-white/15" />

        <div className="overflow-hidden rounded-[1.55rem] bg-[linear-gradient(165deg,#24185F_0%,#2C1F73_55%,#1A245A_100%)]">
          <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-black/40" />

          <div className="space-y-3 px-3.5 pb-5 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading-en text-[10px] tracking-[0.14em] text-brand-aqua uppercase">
                  {brandName}
                </p>
                <p className="mt-1 text-xs font-semibold text-brand-soft">
                  Feed Preview
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-[image:var(--gradient-cta)]" />
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <div className="h-28 bg-[linear-gradient(135deg,rgba(109,40,217,0.55),rgba(34,211,238,0.35))]" />
              <div className="space-y-2 p-3">
                <div className="h-2.5 w-3/4 rounded-full bg-white/70" />
                <div className="h-2 w-full rounded-full bg-white/25" />
                <div className="h-2 w-5/6 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <p className="font-heading-en text-[10px] text-brand-cyan">
                  Branding
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/25" />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <p className="font-heading-en text-[10px] text-brand-aqua">
                  Content
                </p>
                <div className="mt-2 h-1.5 w-4/5 rounded-full bg-white/25" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
