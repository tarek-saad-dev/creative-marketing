import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { niches } from "@/lib/content/niches";
import { NicheLanding } from "@/components/sections/niches/niche-landing";

export const dynamic = "force-dynamic";
const industries = niches.filter(niche=>niche.path.startsWith("/industries/"));
type Props = { params: Promise<{slug:string}> };
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;
  const niche=industries.find(item=>item.slug===slug);
  if(!niche) return {title:"المجال غير موجود",robots:{index:false}};
  return {title:niche.label+" | تسويق وتصميم",description:niche.description,alternates:{canonical:niche.path},openGraph:{title:niche.label+" | Creative Marketing",description:niche.description,url:niche.path,locale:"ar_EG"}};
}
export default async function IndustryPage({params}:Props){
  const {slug}=await params;
  const niche=industries.find(item=>item.slug===slug);
  if(!niche) notFound();
  return <NicheLanding niche={niche} />;
}
