import { Container } from "@/components/ui/container";
import { VisualNoise } from "@/components/ui/visual-noise";
import { HeroContent } from "@/components/sections/hero/hero-content";
import { HeroVisual } from "@/components/sections/hero/hero-visual";
import type { HeroCopy } from "@/components/sections/hero/hero-copy";

type HeroSectionProps = {
  brandName: string;
  copy: HeroCopy;
  showHandAsset: boolean;
};

/**
 * Server-friendly shell. Motion lives in child Client Components.
 */
export function HeroSection({
  brandName,
  copy,
  showHandAsset,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pt-[calc(var(--nav-height)+1.25rem)] pb-16 sm:pb-20 lg:min-h-[min(100svh,56rem)] lg:pb-24"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <VisualNoise opacity={0.035} />

      <Container className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 xl:gap-12">
        <div className="order-1">
          <HeroContent copy={copy} />
        </div>

        <div className="order-2">
          <HeroVisual brandName={brandName} showHandAsset={showHandAsset} />
        </div>
      </Container>
    </section>
  );
}
