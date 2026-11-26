import { getLandingPageData } from "@/server/services/landing-page.service";
import { AuroraMarketingMain } from "@/components/layout/aurora-marketing-main";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { PortfolioHero, PortfolioRail } from "@/components/sections/work/immersive-showcase";
import { MovingPortfolioStrip, DeviceShowcase } from "@/components/sections/work/scroll-motion-showcase";
import { NicheShowcase } from "@/components/sections/niches/niche-showcase";
import { CreativeGallery } from "@/components/sections/work/creative-gallery";
import { getPublishedCreativeGallery, getPublishedShowcaseProjects } from "@/server/services/project.service";
import { SectionBridge } from "@/components/motion/section-bridge";
import { TrustStrip } from "@/components/sections/trust-strip";
import { WorkSection } from "@/components/sections/work/work-section";
import { ServicesSection } from "@/components/sections/services/services-section";
import { CommercialSection } from "@/components/sections/commercial/commercial-section";
import { LeadFunnelProvider } from "@/components/lead/lead-funnel-provider";
import {
  buildHeroCopy,
  buildContactAndSocialLinks,
} from "@/components/sections/hero/hero-copy";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";

export const dynamic = "force-dynamic";

export default async function MarketingHomePage() {
  const [data, showcaseProjects, creativeGallery] = await Promise.all([
    getLandingPageData(),
    getPublishedShowcaseProjects(),
    getPublishedCreativeGallery(),
  ]);
  const hasActiveOffer = Boolean(data.activeOffer);
  const hasPublishedPrices = data.packages.length > 0;
  const copy = buildHeroCopy({
    settings: data.settings,
    hasActiveOffer,
    hasPublishedPrices,
  });
  const { contactLinks, socialLinks } = buildContactAndSocialLinks(
    data.settings
  );

  const funnelPackages = data.packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
  }));
  const funnelServices = data.services.map(service => ({
    id: service.id,
    nameAr: service.nameAr,
    slug: service.slug,
  }));

  return (
    <LeadFunnelProvider
      packages={funnelPackages}
      services={funnelServices}
      hasWhatsApp={data.contactReadiness.hasWhatsApp}
    >
      <FaqJsonLd faqs={data.faqs} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        تخطي إلى المحتوى
      </a>

      <MarketingHeader brandName={data.brand.name} />

      <AuroraMarketingMain>
        <PortfolioHero
          copy={copy}
          projects={showcaseProjects}
          slogan={data.brand.slogan}
        />
        {showcaseProjects.length >= 3 && <MovingPortfolioStrip projects={showcaseProjects.slice(0, 8)} />}
        <TrustStrip
          serviceGroups={data.serviceGroups}
          trustMetrics={data.trustMetrics}
          clientLogos={data.clientLogos}
        />
        {showcaseProjects.length > 0 && <WorkSection projects={showcaseProjects.slice(0, 6)} />}
        <SectionBridge words={["THINK.", "CREATE.", "BUILD.", "GROW."]} />
        <ServicesSection ecosystem={data.serviceEcosystem} />
        <NicheShowcase />
        {showcaseProjects.length > 1 && <DeviceShowcase projects={showcaseProjects.slice(0, 6)} />}
        {showcaseProjects.some(project => project.primaryMediaType === "VIDEO") && <PortfolioRail projects={showcaseProjects} showreelOnly />}
        <CreativeGallery projects={creativeGallery} sectionId={showcaseProjects.length ? "creative-gallery" : "work"} />
        <SectionBridge words={["IDEAS.", "DESIGN.", "IMPACT."]} />
        <CommercialSection
          data={{
            offer: data.offer,
            packages: data.packages,
            testimonials: data.testimonials,
            faqs: data.faqs,
            settings: data.settings,
          }}
        />
      </AuroraMarketingMain>

      <MarketingFooter
        brandName={data.brand.name}
        slogan={data.brand.slogan}
        contactLinks={contactLinks}
        socialLinks={socialLinks}
      />

      <MobileStickyCta />
    </LeadFunnelProvider>
  );
}
