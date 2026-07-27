"use client";

import Image from "next/image";
import { FloatingElement } from "@/components/motion/floating-element";
import { MouseParallax } from "@/components/motion/mouse-parallax";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { PhoneMockup } from "@/components/sections/hero/phone-mockup";
import {
  FloatingContentCard,
  defaultFloatingCards,
} from "@/components/sections/hero/floating-content-card";
import { HERO_HAND_ASSET } from "@/components/sections/hero/hero-copy";
import { cn } from "@/lib/utils";

type HeroVisualProps = {
  brandName: string;
  showHandAsset: boolean;
};

export function HeroVisual({ brandName, showHandAsset }: HeroVisualProps) {
  const cards = defaultFloatingCards;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <BackgroundGlow
        tone="violet"
        className="start-1/2 top-8 h-56 w-56 -translate-x-1/2"
      />
      <BackgroundGlow tone="aqua" className="-end-4 bottom-10 h-40 w-40" />
      <BackgroundGlow tone="cyan" className="start-0 top-1/3 h-36 w-36" />

      <MouseParallax
        strength={10}
        className="relative min-h-[26rem] sm:min-h-[28rem]"
      >
        {/* Optional hand layer — drop /public/hero/hand-phone.webp to enable */}
        {showHandAsset ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex justify-center">
            <Image
              src={HERO_HAND_ASSET}
              alt=""
              width={520}
              height={640}
              className="h-auto w-[min(100%,22rem)] object-contain"
              priority={false}
            />
          </div>
        ) : null}

        <div
          className={cn(
            "relative z-[3] flex justify-center pt-6",
            showHandAsset && "pt-2"
          )}
        >
          <FloatingElement amplitude={6} duration={8}>
            <PhoneMockup brandName={brandName} />
          </FloatingElement>
        </div>

        {/* Desktop / tablet floating cards */}
        <FloatingElement
          className="absolute start-0 top-8 hidden sm:block md:start-2"
          amplitude={7}
          duration={7.5}
          delay={0.2}
        >
          <FloatingContentCard card={cards[0]} className="rotate-[-8deg]" />
        </FloatingElement>

        <FloatingElement
          className="absolute end-0 top-16 hidden sm:block md:end-2"
          amplitude={9}
          duration={8.2}
          delay={0.4}
        >
          <FloatingContentCard card={cards[1]} className="rotate-[7deg]" />
        </FloatingElement>

        <FloatingElement
          className="absolute bottom-16 start-2 hidden md:block"
          amplitude={6}
          duration={7.8}
          delay={0.1}
        >
          <FloatingContentCard card={cards[2]} className="rotate-[5deg]" />
        </FloatingElement>

        <FloatingElement
          className="absolute -end-1 bottom-24 hidden lg:block"
          amplitude={8}
          duration={9}
          delay={0.35}
        >
          <FloatingContentCard card={cards[3]} className="rotate-[-5deg]" />
        </FloatingElement>

        {/* Mobile: keep two cards only */}
        <div className="absolute inset-x-0 top-2 flex justify-between px-1 sm:hidden">
          <FloatingContentCard
            card={cards[0]}
            className="w-[7.75rem] rotate-[-6deg] scale-90"
          />
          <FloatingContentCard
            card={cards[1]}
            className="w-[7.75rem] rotate-[6deg] scale-90"
          />
        </div>
      </MouseParallax>
    </div>
  );
}
