import "server-only";
import {getAllSiteSettings} from "@/server/repositories/site-settings.repository";
import {readSeo} from "@/lib/content/seo";
export async function getPublicSeo(){
 const settings=await getAllSiteSettings().catch(()=>({}));
 return readSeo(settings,{publicUrl:process.env.NEXT_PUBLIC_SITE_URL,productionHost:process.env.VERCEL_PROJECT_PRODUCTION_URL});
}
