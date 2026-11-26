import Link from "next/link";
import { PORTFOLIO_SETTING_KEY, readPortfolioSettings, selectPortfolioProjects } from "@/lib/content/portfolio-settings";
import { getLandingPageData } from "@/server/services/landing-page.service";
import { AuroraMarketingMain } from "@/components/layout/aurora-marketing-main";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { PortfolioHero, PortfolioRail } from "@/components/sections/work/immersive-showcase";
import { MovingPortfolioStrip, DeviceShowcase } from "@/components/sections/work/scroll-motion-showcase";
import { NicheShowcase } from "@/components/sections/niches/niche-showcase";
import { CreativeGallery } from "@/components/sections/work/creative-gallery";
import { getPublishedCreativeGallery, getPublishedShowcaseProjects, getPublishedHeroMedia } from "@/server/services/project.service";
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
  const portfolio = readPortfolioSettings(data.settings[PORTFOLIO_SETTING_KEY]);
  const heroProjects = selectPortfolioProjects(showcaseProjects,portfolio,"hero");
  const heroGallery = await getPublishedHeroMedia(heroProjects.map(project=>project.id));
  const streamProjects = selectPortfolioProjects(showcaseProjects,portfolio,"stream");
  const selectedProjects = selectPortfolioProjects(showcaseProjects,portfolio,"selected");
  const deviceProjects = selectPortfolioProjects(showcaseProjects,portfolio,"device");
  const reelProjects = selectPortfolioProjects(showcaseProjects,portfolio,"reel");
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
          projects={heroProjects}
          gallery={heroGallery}
          showArtwork={portfolio.hero.enabled && (heroProjects.length > 0 || (!showcaseProjects.length && !portfolio.hero.ids.length))}
          slogan={data.brand.slogan}
        />
        {streamProjects.length >= 3 && <MovingPortfolioStrip projects={streamProjects} />}
        <TrustStrip
          serviceGroups={data.serviceGroups}
          trustMetrics={data.trustMetrics}
          clientLogos={data.clientLogos}
        />
        {selectedProjects.length > 0 && <WorkSection projects={selectedProjects} />}
        {!selectedProjects.length && !portfolio.gallery && <section id="work" className="mx-auto max-w-7xl scroll-mt-nav px-5 py-12"><h2 className="font-headline text-3xl font-bold text-white">كل أعمالنا.</h2><Link href="/work" className="mt-4 inline-flex min-h-11 items-center text-brand-aqua underline">استكشف معرض المشاريع</Link></section>}
        <SectionBridge words={["THINK.", "CREATE.", "BUILD.", "GROW."]} />
        <ServicesSection ecosystem={data.serviceEcosystem} />
        <NicheShowcase />
        {deviceProjects.length > 1 && <DeviceShowcase projects={deviceProjects} />}
        {reelProjects.length > 0 && <PortfolioRail projects={reelProjects} showreelOnly />}
        {portfolio.gallery && <CreativeGallery projects={creativeGallery} sectionId={selectedProjects.length ? "creative-gallery" : "work"} showComparisons={portfolio.comparisons} />}
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
