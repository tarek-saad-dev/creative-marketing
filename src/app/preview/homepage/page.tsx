import Link from "next/link";
import {VisualJumpNav} from "@/components/admin/website/visual-jump-nav";
import {notFound} from "next/navigation";
import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {getSiteSettingByKey} from "@/server/repositories/site-settings.repository";
import {sectionNames,readWorkspaceSection,websiteSectionHref} from "@/lib/admin/website-workspace";
import {HOMEPAGE_EDITOR_KEY,readHomeEditor} from "@/lib/content/homepage-editor";
import {HomepageView} from "@/components/layout/homepage-view";
export const dynamic="force-dynamic";
export const metadata={title:"معاينة الصفحة الرئيسية",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{version?:string;edit?:string;section?:string}>}){
 await requireRole(AdminRole.ADMIN);
 const {version,edit,section}=await searchParams;
 const selected=readWorkspaceSection(section);
 const editor=readHomeEditor(await getSiteSettingByKey(HOMEPAGE_EDITOR_KEY));
 const archived=version===undefined?null:typeof version==="string"&&/^\d+$/.test(version)?editor.history.find(v=>v.id===Number(version)):undefined;
 if(version!==undefined&&!archived)notFound();
 const layout=archived?.layout??editor.draft??editor.published;
 const visual=edit==="1"&&!archived;
 const label=archived?"معاينة إصدار سابق":editor.draft?"معاينة المسودة المحفوظة":"معاينة النسخة المنشورة";
 if(visual)return <><div data-visual-toolbar className="sticky top-0 z-[110] space-y-2 border-b border-[#27e8c7]/40 bg-[#111827] px-3 py-3 text-white"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs text-[#27e8c7]">شوف موقعك واختار الجزء اللي عاوز تعدله</p><p className="text-sm font-bold">{label}</p></div><div className="flex flex-wrap gap-2"><Link href={selected?websiteSectionHref(selected):"/admin/website"} className="rounded-lg bg-[#27e8c7] px-3 py-2 text-xs font-bold text-[#111827]">إدارة الموقع</Link><Link href={selected?"/preview/homepage?section="+selected:"/preview/homepage"} className="rounded-lg border border-white/30 px-3 py-2 text-xs font-bold text-white">معاينة بدون أدوات</Link></div></div><VisualJumpNav sections={layout.sections.map(s=>({id:s.id,label:sectionNames[s.id]}))}/><p className="hidden text-xs text-white/75 sm:block">اضغط «تعديل هذا القسم» فوق الجزء المطلوب. المعاينة تعرض آخر محتوى محفوظ.</p></div><HomepageView preview visual previewLayout={layout}/></>;
 return <><div inert><HomepageView preview previewLayout={layout}/></div><div className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center justify-center gap-3 bg-[#111827] px-4 py-3 text-sm text-white"><span>{label} · للعرض فقط، لا ترسل طلبات حقيقية</span><Link href={selected?websiteSectionHref(selected):"/admin/pages"} className="rounded-lg bg-[#27e8c7] px-4 py-2 font-semibold text-[#111827]">العودة للمحرر</Link></div></>;
}
