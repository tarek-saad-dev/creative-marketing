import { getLandingPageData } from "@/server/services/landing-page.service";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { HeroSection } from "@/components/sections/hero/hero-section";
import { TrustStrip } from "@/components/sections/trust-strip";
import { WorkSection } from "@/components/sections/work/work-section";
import { ServicesSection } from "@/components/sections/services/services-section";
import { CommercialSection } from "@/components/sections/commercial/commercial-section";
import { LeadFunnelProvider } from "@/components/lead/lead-funnel-provider";
import {
  buildHeroCopy,
  buildContactAndSocialLinks,
} from "@/components/sections/hero/hero-copy";
import { heroHandAssetExists } from "@/components/sections/hero/hero-assets";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";

export const dynamic = "force-dynamic";

export default async function MarketingHomePage() {
  const data = await getLandingPageData();
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
  const showHandAsset = heroHandAssetExists();

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

      <main id="main-content">
        <HeroSection
          brandName={data.brand.name}
          copy={copy}
          showHandAsset={showHandAsset}
        />
        <TrustStrip
          serviceGroups={data.serviceGroups}
          trustMetrics={data.trustMetrics}
          clientLogos={data.clientLogos}
        />
        <WorkSection projects={data.featuredProjects} />
        <ServicesSection ecosystem={data.serviceEcosystem} />
        <CommercialSection
          data={{
            offer: data.offer,
            packages: data.packages,
            testimonials: data.testimonials,
            faqs: data.faqs,
            settings: data.settings,
          }}
        />
      </main>

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
