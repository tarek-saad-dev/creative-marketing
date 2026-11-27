import Link from "next/link";
import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {getWebsiteJourneyData} from "@/server/services/admin/website-journey.service";
import {getPublishedShowcaseProjects} from "@/server/services/project.service";
import {WebsiteJourney} from "@/components/admin/website/website-journey";
import {HomepageEditorForm} from "@/components/admin/content/homepage-editor-form";
import {PortfolioControlForm} from "@/components/admin/projects/portfolio-control-form";
import {ServicesPanel} from "@/components/admin/content/services-panel";
import {PackagesPanel} from "@/components/admin/content/packages-panel";
import {OffersPanel} from "@/components/admin/content/offers-panel";
import {TestimonialsPanel} from "@/components/admin/content/testimonials-panel";
import {TrustPanel} from "@/components/admin/content/trust-panel";
import {LogosPanel} from "@/components/admin/content/logos-panel";
import {FaqsPanel} from "@/components/admin/content/faqs-panel";
import {SettingsPanel} from "@/components/admin/content/settings-panel";
import {sectionGroups,sectionNames,artworkSlots,readWorkspaceSection,readWorkspaceTab,sectionTabs,websiteSectionHref} from "@/lib/admin/website-workspace";
import {ArrowUpLeft,Eye,Settings2,ChevronDown} from "lucide-react";
export const metadata={title:"إدارة الموقع"};
export const dynamic="force-dynamic";
const action="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-primary";
export default async function Page({searchParams}:{searchParams:Promise<{section?:string;tab?:string;status?:string;edit?:string;new?:string}>}){
 const user=await requireRole(AdminRole.ADMIN);
 const sp=await searchParams,selected=readWorkspaceSection(sp.section);
 const {readiness,editor,portfolio,copy}=await getWebsiteJourneyData();
 const tab=selected?readWorkspaceTab(selected,sp.tab):null;
 const projects=tab==="artwork"?await getPublishedShowcaseProjects():[];
 const layout=editor.draft??editor.published;
 const sectionLinks=<>{sectionGroups.map(group=><div key={group.title} className="space-y-1"><p className="px-3 pt-3 text-xs font-bold text-foreground-muted">{group.title}</p>{group.sections.map(id=><Link key={id} href={websiteSectionHref(id)} aria-current={selected===id?"page":undefined} className={"flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 text-sm "+(selected===id?"bg-[#2c1f73] font-bold text-white":"text-foreground hover:bg-muted")}><span>{sectionNames[id]}</span><ArrowUpLeft size={14} className="shrink-0"/></Link>)}</div>)}</>;
 return <div className="space-y-5" data-website-workspace>
 <AdminPageHeader title="إدارة الموقع" description="اختار الجزء اللي عاوز تعدّله. كل أدواته هتظهر قدامك هنا." breadcrumbs={[{label:"الرئيسية",href:"/admin"},{label:"إدارة الموقع"}]} actions={<Link href="/preview/homepage?edit=1" className={action}><Eye size={17}/>تعديل من شكل الموقع</Link>}/>
 {editor.draft&&<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><span>عندك مسودة نصوص وتخطيط لم تُنشر.</span><Link href={websiteSectionHref("hero")} className="font-bold underline">استكمال المسودة</Link></div>}
 <div className="grid items-start gap-4 xl:grid-cols-[230px_minmax(0,1fr)]">
 <aside className="admin-card hidden p-2 xl:block" aria-label="أجزاء الموقع">{sectionLinks}<div className="mt-3 border-t border-border pt-2"><Link href="/admin/pages" className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-foreground-muted"><Settings2 size={16}/>ترتيب الصفحة والإصدارات</Link></div></aside>
 <details className="admin-card p-3 xl:hidden"><summary className="flex cursor-pointer items-center justify-between gap-2 font-bold">{selected?sectionNames[selected]:"اختار جزء من الموقع"}<ChevronDown size={18}/></summary><nav className="mt-2" aria-label="أجزاء الموقع على الموبايل">{sectionLinks}</nav><Link href="/admin/pages" className="mt-2 block text-sm text-primary">ترتيب الصفحة والإصدارات</Link></details>
 <div className="min-w-0 space-y-4">
 {!selected?<><WebsiteJourney readiness={readiness} role={user.role} compact/><section className="admin-card space-y-4 p-4 sm:p-5"><h2 className="font-headline text-xl font-bold">عاوز تعدّل إيه؟</h2><div className="grid gap-3 sm:grid-cols-2">{([{id:"hero",desc:"العنوان والصور اللي العميل بيشوفها أول ما يدخل."},{id:"work",desc:"اختار الأعمال اللي تظهر للزوار."},{id:"services",desc:"عدّل اللي بتقدمه للعملاء."},{id:"packages",desc:"عدّل الأسعار والمميزات."},{id:"industries",desc:"الصالونات والمدرسين والكتب."},{id:"contact",desc:"بيانات الشركة وطرق التواصل."}] as const).map(item=><Link key={item.id} href={websiteSectionHref(item.id)} className="rounded-xl border border-border p-4 hover:border-primary"><p className="font-bold">{sectionNames[item.id]}</p><p className="mt-1 text-sm leading-6 text-foreground-muted">{item.desc}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">تعديل<ArrowUpLeft size={14}/></span></Link>)}</div></section><div className="admin-card flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-bold">الشعار والهوية</p><p className="text-xs text-foreground-muted">اللوجو الذي يظهر أعلى وأسفل الموقع.</p></div><Link href="/admin/brand" className={action}>تعديل الشعار</Link></div></>:<>
 <section className="admin-card space-y-3 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-headline text-xl font-bold">{sectionNames[selected]}</h2><p className="mt-1 text-xs text-foreground-muted">{layout.sections.find(s=>s.id===selected)?.enabled?"مُفعّل في التخطيط":"مخفي"}</p></div><Link href={"/preview/homepage?edit=1#visual-"+selected} className={action}><Eye size={16}/>شوفه في الموقع</Link></div>
 {sectionTabs(selected).length>1&&<nav aria-label="أدوات القسم" className="flex flex-wrap gap-2 border-t border-border pt-3">{sectionTabs(selected).map(t=><Link key={t.id} href={websiteSectionHref(selected,t.id)} aria-current={tab===t.id?"page":undefined} className={"inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold "+(tab===t.id?"bg-[#2c1f73] text-white":"bg-muted text-foreground")}>{t.label}</Link>)}</nav>}</section>
 {tab==="artwork"&&artworkSlots[selected]&&<PortfolioControlForm key={selected} initial={portfolio} projects={projects} focus={artworkSlots[selected]}/>}
 {tab==="logos"&&<LogosPanel canEdit/>}
 {tab==="content"&&selected==="services"&&<ServicesPanel canEdit canArchive/>}
 {tab==="content"&&selected==="packages"&&<PackagesPanel canEdit canPublish filter={["all","PUBLISHED","DRAFT","ARCHIVED","incomplete"].includes(sp.status??"")?sp.status:"all"} editId={sp.edit} newPackage={sp.new==="1"}/>}
 {tab==="content"&&selected==="offer"&&<OffersPanel canEdit editId={sp.edit} newOffer={sp.new==="1"}/>}
 {tab==="content"&&selected==="testimonials"&&<TestimonialsPanel canEdit/>}
 {tab==="content"&&selected==="trust"&&<TrustPanel canEdit/>}
 {tab==="content"&&selected==="faq"&&<FaqsPanel canEdit/>}
 {tab==="content"&&selected==="contact"&&<SettingsPanel canEdit/>}
 {(tab==="layout"||tab==="content"&&["hero","industries","process","bridge1","bridge2"].includes(selected))&&<HomepageEditorForm key={selected+"-"+tab} initial={editor} initialSection={selected} focused heroDefaults={{heroTitle:copy.title,heroDescription:copy.description,heroPrimaryCta:copy.primaryCta,heroSecondaryCta:copy.secondaryCta}}/>}
 </>}
 </div></div></div>;
}
