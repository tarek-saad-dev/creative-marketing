import type {Metadata} from "next";
import {HomepageView} from "@/components/layout/homepage-view";
import {getPublicSeo} from "@/server/services/seo.service";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{
 const seo=await getPublicSeo();
 return {alternates:{canonical:"/"},openGraph:{title:seo.title,description:seo.description,url:"/",type:"website",locale:"ar_EG",siteName:"Creative Marketing",images:seo.image?[seo.image]:undefined}};
}
export default async function MarketingHomePage(){return <HomepageView/>;}
