import { Container } from "@/components/ui/container";
import { CinematicSection } from "@/components/ui/cinematic-section";
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
    <CinematicSection
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[min(100svh,58rem)] items-center bg-[image:var(--gradient-hero-cinematic)] pb-16 pt-[calc(var(--nav-height)+1.25rem)] sm:pb-20 lg:pb-24"
      backdropWord="BRAND"
      backdropPosition="center"
    >
      <VisualNoise opacity={0.03} />

      <Container className="relative grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 xl:gap-12">
        <div className="order-1">
          <HeroContent copy={copy} />
        </div>

        <div className="order-2">
          <HeroVisual brandName={brandName} showHandAsset={showHandAsset} />
        </div>
      </Container>
    </CinematicSection>
  );
}
