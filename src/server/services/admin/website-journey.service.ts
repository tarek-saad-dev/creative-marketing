import "server-only";
import {getAdminDashboardData,type AdminDashboardData} from "./dashboard.admin.service";
import {getAllSiteSettings} from "@/server/repositories/site-settings.repository";
import {getPublishedShowcaseProjects} from "@/server/services/project.service";
import {BRAND_ASSETS_KEY,readBrandAssets} from "@/lib/content/brand-assets";
import {HOMEPAGE_EDITOR_KEY,readHomeEditor} from "@/lib/content/homepage-editor";
import {PORTFOLIO_SETTING_KEY,readPortfolioSettings,selectPortfolioProjects} from "@/lib/content/portfolio-settings";
import {buildHeroCopy} from "@/components/sections/hero/hero-copy";
export async function getWebsiteJourneyData(existing?:AdminDashboardData){
 const [data,settings,projects]=await Promise.all([existing??getAdminDashboardData(),getAllSiteSettings(),getPublishedShowcaseProjects()]);
 const brand=readBrandAssets(settings[BRAND_ASSETS_KEY]),editor=readHomeEditor(settings[HOMEPAGE_EDITOR_KEY]),portfolio=readPortfolioSettings(settings[PORTFOLIO_SETTING_KEY]);
 const hero=selectPortfolioProjects(projects,portfolio,"hero");
 const copy=buildHeroCopy({settings,hasActiveOffer:data.counts.offersActive>0,hasPublishedPrices:data.counts.packagesPublished>0});
 const whatsapp=typeof settings["brand.whatsapp"]==="string"?settings["brand.whatsapp"].replace(/\D/g,""):"";
 const readiness={logo:Boolean(brand.headerLogo),whatsapp:/^[1-9]\d{7,14}$/.test(whatsapp),projectsPublished:data.counts.projectsPublished,projectsDraft:data.counts.projectsDraft,heroProjects:hero.length,heroEnabled:portfolio.hero.enabled,services:data.counts.services,packagesPublished:data.counts.packagesPublished,packagesDraft:data.counts.packagesDraft,invalidPublishedPrices:data.warnings.some(w=>w.id==="packages-invalid-price")};
 return {data,brand,editor,portfolio,hero,copy,readiness};
}
