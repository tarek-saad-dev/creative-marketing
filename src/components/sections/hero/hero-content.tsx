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
    <div className="relative z-10 max-w-2xl space-y-8 lg:max-w-xl xl:max-w-2xl">
      <Reveal>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
      </Reveal>

      <Reveal delay={0.06}>
        <h1
          id="hero-heading"
          className="font-headline text-display-2xl text-balance text-foreground text-editorial"
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
        <p className="body-text max-w-xl">
          {copy.description}
        </p>
      </Reveal>

      <Stagger
        className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center"
        delayChildren={0.2}
      >
        <BrandButton href="#work" size="lg">
          {copy.primaryCta}
        </BrandButton>
        <BrandButton href="#packages" variant="secondary" size="lg">
          {copy.secondaryCta}
        </BrandButton>
      </Stagger>

      <Reveal delay={0.34}>
        <p className="body-text-muted">{copy.microcopy}</p>
      </Reveal>
    </div>
  );
}
