import { BRAND_ASSETS_KEY, readBrandAssets } from "@/lib/content/brand-assets";
import Link from "next/link";
import {Fragment,type ReactNode} from "react";
import {HOMEPAGE_EDITOR_KEY,readHomeEditor,type HomeSectionId,type HomeLayout} from "@/lib/content/homepage-editor";
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
import { CommercialSectionPart } from "@/components/sections/commercial/commercial-section";
import { LeadFunnelProvider } from "@/components/lead/lead-funnel-provider";
import {
  buildHeroCopy,
  buildContactAndSocialLinks,
} from "@/components/sections/hero/hero-copy";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";

export async function HomepageView({preview=false,previewLayout}:{preview?:boolean;previewLayout?:HomeLayout}={}) {
  const [data, showcaseProjects, creativeGallery] = await Promise.all([
    getLandingPageData(),
    getPublishedShowcaseProjects(),
    getPublishedCreativeGallery(),
  ]);
  const editor=readHomeEditor(data.settings[HOMEPAGE_EDITOR_KEY]);
  const layout=preview?(previewLayout??editor.draft??editor.published):editor.published;
  const enabled=new Set(layout.sections.filter(s=>s.enabled).map(s=>s.id));
  const portfolio = readPortfolioSettings(data.settings[PORTFOLIO_SETTING_KEY]);
  const heroProjects = selectPortfolioProjects(showcaseProjects,portfolio,"hero");
  const heroGallery = await getPublishedHeroMedia(heroProjects.map(project=>project.id));
  const streamProjects = selectPortfolioProjects(showcaseProjects,portfolio,"stream");
  const selectedProjects = selectPortfolioProjects(showcaseProjects,portfolio,"selected");
  const deviceProjects = selectPortfolioProjects(showcaseProjects,portfolio,"device");
  const reelProjects = selectPortfolioProjects(showcaseProjects,portfolio,"reel");
  const hasActiveOffer = Boolean(data.activeOffer);
  const hasPublishedPrices = data.packages.length > 0;
  const originalCopy = buildHeroCopy({
    settings: data.settings,
    hasActiveOffer,
    hasPublishedPrices,
  });
  const copy={...originalCopy,title:layout.copy.heroTitle||originalCopy.title,description:layout.copy.heroDescription||originalCopy.description,primaryCta:layout.copy.heroPrimaryCta||originalCopy.primaryCta,secondaryCta:layout.copy.heroSecondaryCta||originalCopy.secondaryCta,highlightPhrase:layout.copy.heroTitle?"":originalCopy.highlightPhrase};
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

  const hasWork=enabled.has("work")&&selectedProjects.length>0;
  const hasGallery=enabled.has("gallery")&&portfolio.gallery;
  const fallbackWork=<section id="work" className="mx-auto max-w-7xl scroll-mt-nav px-5 py-12"><h2 className="font-headline text-3xl font-bold text-white">كل أعمالنا.</h2><Link href="/work" className="mt-4 inline-flex min-h-11 items-center text-brand-aqua underline">استكشف معرض المشاريع</Link></section>;
  const commercial={offer:data.offer,packages:data.packages,testimonials:data.testimonials,faqs:data.faqs,settings:data.settings};
  const part=(id:"offer"|"packages"|"process"|"testimonials"|"faq"|"contact")=><CommercialSectionPart part={id} data={commercial} copy={layout.copy}/>;
  const nodes:Record<HomeSectionId,ReactNode>={
    hero:<PortfolioHero copy={copy} projects={heroProjects} gallery={heroGallery} mockups={portfolio.mockups} showArtwork={portfolio.hero.enabled&&(heroProjects.length>0||(!showcaseProjects.length&&!portfolio.hero.ids.length))} slogan={data.brand.slogan}/>,
    stream:streamProjects.length>=3?<MovingPortfolioStrip projects={streamProjects}/>:null,
    trust:<TrustStrip serviceGroups={data.serviceGroups} trustMetrics={data.trustMetrics} clientLogos={data.clientLogos}/>,
    work:hasWork?<WorkSection projects={selectedProjects}/>:!hasGallery?fallbackWork:null,
    bridge1:<SectionBridge words={["THINK.","CREATE.","BUILD.","GROW."]}/>,
    services:<ServicesSection ecosystem={data.serviceEcosystem}/>,
    industries:<NicheShowcase/>,
    device:deviceProjects.length>1?<DeviceShowcase projects={deviceProjects}/>:null,
    reel:reelProjects.length>0?<PortfolioRail projects={reelProjects} showreelOnly/>:null,
    gallery:hasGallery?<CreativeGallery projects={creativeGallery} sectionId={hasWork?"creative-gallery":"work"} showComparisons={portfolio.comparisons}/>:null,
    bridge2:<SectionBridge words={["IDEAS.","DESIGN.","IMPACT."]}/>,
    offer:part("offer"),packages:part("packages"),process:part("process"),testimonials:part("testimonials"),faq:part("faq"),contact:part("contact")
  };
  return (
    <LeadFunnelProvider
      packages={funnelPackages}
      services={funnelServices}
      hasWhatsApp={data.contactReadiness.hasWhatsApp}
      readOnly={preview}
    >
      {!preview&&enabled.has("faq")&&<FaqJsonLd faqs={data.faqs} />}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        تخطي إلى المحتوى
      </a>

      <MarketingHeader assets={readBrandAssets(data.settings[BRAND_ASSETS_KEY])} brandName={data.brand.name} />

      <AuroraMarketingMain>
        {layout.sections.filter(section=>section.enabled).map(section=><Fragment key={section.id}>{nodes[section.id]}{section.id==="hero"&&!hasWork&&!hasGallery&&!enabled.has("work")?fallbackWork:null}</Fragment>)}
      </AuroraMarketingMain>

      <MarketingFooter assets={readBrandAssets(data.settings[BRAND_ASSETS_KEY])}
        brandName={data.brand.name}
        slogan={data.brand.slogan}
        contactLinks={contactLinks}
        socialLinks={socialLinks}
      />

      {!preview&&<MobileStickyCta />}
    </LeadFunnelProvider>
  );
}
