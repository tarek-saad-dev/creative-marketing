import Link from "next/link";
import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {getWebsiteJourneyData} from "@/server/services/admin/website-journey.service";
import {homeSections,type HomeSectionId} from "@/lib/content/homepage-editor";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {HomepageEditorForm} from "@/components/admin/content/homepage-editor-form";
export const dynamic="force-dynamic";
export const metadata={title:"ترتيب أقسام الصفحة الرئيسية"};
export default async function Page({searchParams}:{searchParams:Promise<{section?:string}>}){
 await requireRole(AdminRole.ADMIN);
 const sp=await searchParams;
 const initialSection=homeSections.find(s=>s.id===sp.section)?.id??"hero" as HomeSectionId;
 const {editor:state,copy}=await getWebsiteJourneyData();
 return <><AdminPageHeader title="ترتيب الأقسام والنشر" description="عدّل نصوص الصفحة وترتيب الأقسام، ثم احفظ مسودة وعاينها وانشرها." breadcrumbs={[{label:"الرئيسية",href:"/admin"},{label:"إدارة الموقع",href:"/admin/website"},{label:"ترتيب الأقسام والنشر"}]} actions={<Link href="/admin/website" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-primary">العودة لإدارة الموقع</Link>}/><HomepageEditorForm key={initialSection} initial={state} initialSection={initialSection} heroDefaults={{heroTitle:copy.title,heroDescription:copy.description,heroPrimaryCta:copy.primaryCta,heroSecondaryCta:copy.secondaryCta}}/></>;
}
