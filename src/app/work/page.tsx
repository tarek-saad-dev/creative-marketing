import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedShowcaseProjects } from "@/server/services/project.service";
import { getAllSiteSettings } from "@/server/repositories/site-settings.repository";
import { buildContactAndSocialLinks } from "@/components/sections/hero/hero-copy";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { AuroraMarketingMain } from "@/components/layout/aurora-marketing-main";
import { PortfolioBrowser } from "@/components/sections/work/portfolio-browser";

export const dynamic="force-dynamic";
export const metadata: Metadata={title:"معرض الأعمال",description:"تصفّح مشاريع Creative Marketing المنشورة في التصميم والهوية والمحتوى والفيديو.",alternates:{canonical:"/work"}};
export default async function WorkIndex(){
  const [projects,settings]=await Promise.all([getPublishedShowcaseProjects(),getAllSiteSettings()]);
  const brandName=typeof settings["brand.name"]==="string"?settings["brand.name"]:"Creative Marketing";
  const slogan=typeof settings["brand.slogan"]==="string"?settings["brand.slogan"]:"WE THINK. WE CREATE. YOU GROW.";
  const {contactLinks,socialLinks}=buildContactAndSocialLinks(settings);
  return <><MarketingHeader brandName={brandName}/><AuroraMarketingMain><section className="mx-auto max-w-7xl px-5 pb-16 pt-[calc(var(--nav-height)+4rem)]"><Link href="/" className="text-sm text-brand-aqua">الصفحة الرئيسية</Link><p className="mt-6 text-xs font-bold tracking-widest text-brand-aqua">THE PORTFOLIO</p><h1 className="my-4 font-headline text-[clamp(2rem,5vw,4rem)] font-bold text-white">كل أعمالنا.</h1><PortfolioBrowser projects={projects}/></section></AuroraMarketingMain><MarketingFooter brandName={brandName} slogan={slogan} contactLinks={contactLinks} socialLinks={socialLinks}/></>;
}
