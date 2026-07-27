"use client";

import { Reveal } from "@/components/motion/reveal";
import type { ProcessStep } from "@/lib/content/process-steps";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";
import { cn } from "@/lib/utils";

type ProcessTimelineProps = {
  steps: ProcessStep[];
};

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <ol className="relative grid gap-6 lg:grid-cols-5">
      <div
        className="pointer-events-none absolute start-0 end-0 top-7 hidden h-px bg-border-strong/50 lg:block"
        aria-hidden="true"
      />
      {steps.map((step, index) => (
        <li key={step.number} className="relative">
          <Reveal delay={reduced ? 0 : index * 0.05}>
            <div className="space-y-3">
              <div
                className={cn(
                  "relative z-[1] flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-background-elevated font-heading-en text-sm font-bold text-brand-aqua shadow-soft"
                )}
              >
                {step.number}
              </div>
              <h3 className="font-headline text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-7 text-foreground-muted">
                {step.description}
              </p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
