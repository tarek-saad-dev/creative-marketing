import type { Metadata } from "next";
import { niches } from "@/lib/content/niches";
import { NicheLanding } from "@/components/sections/niches/niche-landing";
export const dynamic = "force-dynamic";
const niche = niches.find(item=>item.slug==="teachers-books")!;
export const metadata: Metadata={title:"Teachers Books | تصميم الكتب والمذكرات التعليمية",description:niche.description,alternates:{canonical:niche.path},openGraph:{title:"Teachers Books | Creative Marketing",description:niche.description,url:niche.path,locale:"ar_EG"}};
export default function TeachersBooksPage(){return <NicheLanding niche={niche} />;}
