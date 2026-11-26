import Link from "next/link";
import { ArrowUpLeft, Check, ArrowLeft } from "lucide-react";
import { getLandingPageData } from "@/server/services/landing-page.service";
import { getPublishedShowcaseProjects } from "@/server/services/project.service";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { AuroraMarketingMain } from "@/components/layout/aurora-marketing-main";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { LeadFunnelProvider } from "@/components/lead/lead-funnel-provider";
import { LeadOpenButton } from "@/components/lead/lead-open-button";
import { buildContactAndSocialLinks } from "@/components/sections/hero/hero-copy";
import { ProjectCard } from "@/components/sections/work/project-card";
import { matchesNiche, niches, type Niche } from "@/lib/content/niches";
import { NicheVisual } from "./niche-showcase";

export async function NicheLanding({ niche }: { niche: Niche }) {
  const [data, projects] = await Promise.all([getLandingPageData(), getPublishedShowcaseProjects()]);
  const related = projects.filter(project => matchesNiche(niche,project)).slice(0,3);
  const {contactLinks,socialLinks} = buildContactAndSocialLinks(data.settings);
  return (
    <LeadFunnelProvider packages={data.packages.map(({id,name,slug})=>({id,name,slug}))} services={data.services.map(({id,nameAr,slug})=>({id,nameAr,slug}))} hasWhatsApp={data.contactReadiness.hasWhatsApp}>
      <MarketingHeader brandName={data.brand.name} contactHref="#contact" />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-toast focus:bg-primary focus:p-3 focus:text-primary-foreground">تخطي إلى المحتوى</a>
      <AuroraMarketingMain>
        <section id="hero" className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-[calc(var(--nav-height)+4rem)] lg:grid-cols-2 lg:pb-20">
          <div className="min-w-0 space-y-5">
            <Link href="/#industries" className="inline-flex min-h-11 items-center gap-2 text-sm text-brand-aqua">العودة إلى المجالات <ArrowLeft size={17} aria-hidden="true" /></Link>
            <p className="text-xs font-bold tracking-widest text-brand-aqua" dir="ltr">{niche.eyebrow}</p>
            <h1 className="font-headline text-[clamp(2rem,5vw,4.2rem)] font-bold leading-[1.5] text-white">{niche.headline}<br /><span className="text-brand-aqua">{niche.highlight}</span></h1>
            <p className="max-w-xl text-base leading-8 text-foreground">{niche.description}</p>
            <div className="flex flex-wrap gap-3">
              <LeadOpenButton source={niche.source+":hero"} isCustom size="lg">اطلب عرضًا مناسبًا</LeadOpenButton>
              <Link href="#niche-services" className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white">اكتشف الخدمات</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/20"><NicheVisual niche={niche} /></div>
        </section>
        <section id="niche-services" className="mx-auto max-w-7xl scroll-mt-nav px-5 py-12">
          <p className="text-xs font-bold tracking-widest text-brand-aqua">WHAT WE CREATE</p>
          <h2 className="mb-6 mt-2 font-headline text-3xl font-bold text-white">خدمات مصممة لاحتياجك.</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {niche.services.map((item,index)=><article key={item.title} className="rounded-2xl border border-white/20 bg-white/5 p-6"><span className="text-sm text-brand-aqua" dir="ltr">0{index+1}</span><h3 className="my-3 font-headline text-xl font-bold text-white">{item.title}</h3><p className="text-sm leading-8 text-foreground">{item.detail}</p></article>)}
          </div>
        </section>
        {related.length > 0 && <section className="mx-auto max-w-7xl px-5 py-12"><h2 className="mb-6 font-headline text-3xl font-bold text-white">مشاريع مرتبطة بالمجال</h2><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{related.map(project=><ProjectCard key={project.id} project={project} role="STANDARD" />)}</div></section>}
        <section className="mx-auto max-w-7xl px-5 py-12"><p className="text-xs font-bold tracking-widest text-brand-aqua">OUR PROCESS</p><h2 className="mb-6 mt-2 font-headline text-3xl font-bold text-white">من الفكرة للتنفيذ.</h2><div className="grid gap-4 md:grid-cols-3">{niche.steps.map(step=><article key={step.title} className="rounded-2xl border border-white/20 bg-white/5 p-5"><Check className="mb-3 text-brand-aqua" aria-hidden="true"/><h3 className="font-bold text-white">{step.title}</h3><p className="mt-2 text-sm leading-7 text-foreground">{step.detail}</p></article>)}</div></section>
        <section id="contact" className="mx-auto max-w-7xl scroll-mt-nav px-5 py-12"><div className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#433487] to-[#205672] px-6 py-12 text-center"><h2 className="font-headline text-3xl font-bold leading-relaxed text-white">جاهز نشتغل على فكرتك؟</h2><p className="mx-auto my-5 max-w-xl leading-8 text-white">احكِ لنا التفاصيل، ونتفق معاك على نطاق العمل والمخرجات والتكلفة المناسبة.</p><LeadOpenButton source={niche.source+":contact"} isCustom size="lg">ابدأ طلبك الآن</LeadOpenButton></div></section>
        <section className="mx-auto max-w-7xl px-5 pb-12"><h2 className="mb-4 text-lg font-bold text-white">استكشف حلولنا الأخرى</h2><div className="flex flex-wrap gap-3">{niches.filter(item=>item.slug!==niche.slug).map(item=><Link key={item.slug} href={item.path} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm text-white hover:bg-white/10">{item.label}<ArrowUpLeft size={17} aria-hidden="true" /></Link>)}</div></section>
      </AuroraMarketingMain>
      <MarketingFooter brandName={data.brand.name} slogan={data.brand.slogan} contactLinks={contactLinks} socialLinks={socialLinks} />
      <MobileStickyCta source={niche.source+":mobile"} isCustom />
    </LeadFunnelProvider>
  );
}
