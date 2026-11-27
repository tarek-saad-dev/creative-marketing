import Link from "next/link";
import {notFound} from "next/navigation";
import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {getSiteSettingByKey} from "@/server/repositories/site-settings.repository";
import {HOMEPAGE_EDITOR_KEY,readHomeEditor} from "@/lib/content/homepage-editor";
import {HomepageView} from "@/components/layout/homepage-view";
export const dynamic="force-dynamic";
export const metadata={title:"معاينة الصفحة الرئيسية",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{version?:string}>}){
 await requireRole(AdminRole.ADMIN);
 const {version}=await searchParams;
 const editor=readHomeEditor(await getSiteSettingByKey(HOMEPAGE_EDITOR_KEY));
 const archived=version===undefined?null:typeof version==="string"&&/^\d+$/.test(version)?editor.history.find(v=>v.id===Number(version)):undefined;
 if(version!==undefined&&!archived)notFound();
 const layout=archived?.layout??editor.draft??editor.published;
 const label=archived?"معاينة إصدار سابق":editor.draft?"معاينة المسودة المحفوظة":"معاينة النسخة المنشورة";
 return <><div inert><HomepageView preview previewLayout={layout}/></div><div className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center justify-center gap-3 bg-[#111827] px-4 py-3 text-sm text-white"><span>{label} · للعرض فقط، لا ترسل طلبات حقيقية</span><Link href="/admin/pages" className="rounded-lg bg-[#27e8c7] px-4 py-2 font-semibold text-[#111827]">العودة للمحرر</Link></div></>;
}
