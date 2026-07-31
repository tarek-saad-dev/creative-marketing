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
        className="pointer-events-none absolute start-0 end-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border-strong/50 to-transparent lg:block"
        aria-hidden="true"
      />
      {steps.map((step, index) => (
        <li key={step.number} className="relative">
          <Reveal delay={reduced ? 0 : index * 0.05}>
            <div className="space-y-3">
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-full card-glass",
                  "h-11 w-11 shrink-0 text-sm font-bold sm:h-12 sm:w-12",
                  index === 0 ? "text-brand-aqua" : "text-foreground-muted"
                )}
              >
                {step.number}
              </div>
              <h3 className="font-headline text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="body-text-muted">
                {step.description}
              </p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
