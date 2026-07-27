"use client";

import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { BrandButton } from "@/components/ui/brand-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GradientText } from "@/components/ui/gradient-text";
import type { HeroCopy } from "@/components/sections/hero/hero-copy";
import { splitTitleWithHighlight } from "@/components/sections/hero/hero-copy";

type HeroContentProps = {
  copy: HeroCopy;
};

export function HeroContent({ copy }: HeroContentProps) {
  const parts = splitTitleWithHighlight(copy.title, copy.highlightPhrase);

  return (
    <div className="relative z-[4] max-w-xl space-y-6 lg:max-w-lg xl:max-w-xl">
      <Reveal>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
      </Reveal>

      <Reveal delay={0.06}>
        <h1
          id="hero-heading"
          className="font-headline text-display-xl text-balance text-foreground"
        >
          {parts.highlight ? (
            <>
              {parts.before}
              <GradientText>{parts.highlight}</GradientText>
              {parts.after}
            </>
          ) : (
            copy.title
          )}
        </h1>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="max-w-lg text-base leading-8 text-foreground-muted sm:text-lg">
          {copy.description}
        </p>
      </Reveal>

      <Stagger
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        delayChildren={0.18}
      >
        <BrandButton href="#work" size="lg">
          {copy.primaryCta}
        </BrandButton>
        <BrandButton href="#packages" variant="secondary" size="lg">
          {copy.secondaryCta}
        </BrandButton>
      </Stagger>

      <Reveal delay={0.28}>
        <p className="text-sm text-foreground-muted">{copy.microcopy}</p>
      </Reveal>
    </div>
  );
}
