import Link from "next/link";
import {readProjectOrigin,artworkReturnHref,projectOriginQuery,sectionNames} from "@/lib/admin/website-workspace";
import { ResilientImage } from "@/components/ui/resilient-media";
import { projectPublishChecklist } from "@/lib/content/project-publishing";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole, ContentStatus } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusBadge } from "@/components/admin/status-badge";
import { ProjectForm } from "@/components/admin/projects/project-form";
import { ProjectMediaManager } from "@/components/admin/projects/project-media-manager";
import { RowActionButton } from "@/components/admin/row-action-button";
import { PreviewButton } from "@/components/admin/preview-button";
import { getAdminProjectById } from "@/server/services/admin/project.admin.service";
import { listAdminServices } from "@/server/services/admin/service.admin.service";
import {
  archiveProjectAction,
  publishProjectAction,
  unpublishProjectAction,
} from "@/server/actions/admin/project.action";
import {ProjectPlacement} from "@/components/admin/projects/project-placement";
import {getPublishedShowcaseProjects} from "@/server/services/project.service";
import {getSiteSettingByKey} from "@/server/repositories/site-settings.repository";
import {PORTFOLIO_SETTING_KEY,readPortfolioSettings} from "@/lib/content/portfolio-settings";
import { isCloudinaryConfigured } from "@/lib/env/server";

export const metadata: Metadata = { title: "تعديل مشروع" };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>;searchParams:Promise<{from?:string}> };

export default async function EditAdminProjectPage({ params,searchParams }: PageProps) {
  const user=await requireRole(AdminRole.EDITOR);
  const { id } = await params;
  const origin=["ADMIN","OWNER"].includes(user.role)?readProjectOrigin((await searchParams).from):null;
  const [project, services] = await Promise.all([
    getAdminProjectById(id),
    listAdminServices(),
  ]);

  if (!project || project.deletedAt) notFound();

  const publishChecklist = projectPublishChecklist(project);
  const readyToPublish = publishChecklist.every(item => item.ok);
  const canPlace=["ADMIN","OWNER"].includes(user.role)&&project.status===ContentStatus.PUBLISHED;
  const placement=canPlace?await Promise.all([getSiteSettingByKey(PORTFOLIO_SETTING_KEY),getPublishedShowcaseProjects()]):null;

  const basicsReady=publishChecklist.slice(0,4).every(i=>i.ok);
  const published=project.status===ContentStatus.PUBLISHED;
  const nextLabel=!basicsReady?"أكمل بيانات المشروع":!readyToPublish?"أضف التصميمات واختر الغلاف":published?"مشروعك منشور":"مشروعك جاهز للنشر";
  const missing=publishChecklist.filter(item=>!item.ok);
  const button="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-primary";
  const primary="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground";
  return <div className="space-y-4" data-project-workspace>
    <AdminPageHeader title={project.title} description="عدّل بيانات المشروع وتصميماته، وانشره لما يكون جاهز." breadcrumbs={[{label:"لوحة التحكم",href:"/admin"},{label:"الأعمال",href:"/admin/projects"+projectOriginQuery(origin)},{label:project.title}]} actions={<ContentStatusBadge status={project.status}/>}/>
    {origin&&<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm"><p>بتجهز شغل لقسم: <b>{sectionNames[origin]}</b></p><Link href={artworkReturnHref(origin,published?project.id:undefined)} className={button}>العودة للقسم</Link></div>}
    <section id="publish" className="admin-card scroll-mt-nav space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold text-primary">{published?"حالة المشروع":"خطوتك التالية"}</p><h2 className="mt-1 font-headline text-lg font-bold">{nextLabel}</h2><p className="mt-1 text-sm text-foreground-muted">جاهزية النشر: {readyToPublish?"مكتمل":"ناقص"}</p></div>
      {!published&&readyToPublish?<div className="flex flex-wrap items-center gap-2"><PreviewButton path={"/work/"+project.slug} label="معاينة التفاصيل"/><RowActionButton id={project.id} action={publishProjectAction} label="نشر" successHref={origin?artworkReturnHref(origin,project.id):undefined} confirmMessage="نشر المشروع للجمهور وإضافته إلى المعارض؟" variant="primary" className="min-h-11 bg-[#2c1f73] px-5 text-white hover:bg-[#24185f] hover:text-white"/></div>:!published?<a href={basicsReady?"#media":"#details"} className={primary}>{basicsReady?"إضافة التصميمات":"تعديل البيانات"}</a>:<div className="flex flex-wrap gap-2"><Link href={"/work/"+project.slug} target="_blank" rel="noopener noreferrer" className={button}>فتح المشروع المنشور</Link>{origin&&<Link href={artworkReturnHref(origin,project.id)} className={primary}>اختيار عرضه في الموقع</Link>}</div>}</div>
      {missing.length>0&&<p className="text-xs leading-6 text-amber-800">المتبقي: {missing.map(i=>i.label).join("، ")}</p>}
      <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs sm:text-sm">{[{label:"البيانات",ok:basicsReady,href:"#details"},{label:"التصميمات والغلاف",ok:readyToPublish,href:"#media"},{label:"النشر",ok:published,href:"#publish"}].map((step,i)=><a key={step.href} href={step.href} className={"rounded-lg border p-2 text-center "+(step.ok?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-border text-foreground-muted")}>{step.ok?"✓ ":String(i+1)+". "}{step.label}</a>)}</div>
    </section>
    <div className="flex flex-col gap-4">
      <section id="media" data-project-media className={"admin-card scroll-mt-nav space-y-3 p-4 "+(basicsReady?"order-1":"order-2")}>
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-headline text-lg font-bold">تصميمات المشروع</h2><p className="mt-1 text-xs text-foreground-muted">ارفع الصور والفيديوهات، واختار صورة الغلاف.</p></div>{project.coverImageUrl&&<div className="flex items-center gap-2"><div className="relative h-14 w-14 overflow-hidden rounded-lg bg-muted"><ResilientImage src={project.coverImageUrl} alt={project.coverImageAlt||project.title} sizes="56px"/></div><span className="text-xs text-foreground-muted">الغلاف الحالي</span></div>}</div>
        <ProjectMediaManager projectId={project.id} projectSlug={project.slug} media={project.media} coverImageUrl={project.coverImageUrl} canAutoCover={project.status===ContentStatus.DRAFT} cloudinaryConfigured={isCloudinaryConfigured()}/>
      </section>
      <details id="details" open={!basicsReady||undefined} className={"admin-card scroll-mt-nav p-4 "+(basicsReady?"order-2":"order-1")}><summary className="cursor-pointer font-bold">تعديل بيانات المشروع</summary><div className="mt-4"><ProjectForm key={project.coverImageUrl||"no-cover"} project={project} services={services.filter(s=>s.isActive||project.projectServices.some(ps=>ps.serviceId===s.id)).map(s=>({id:s.id,nameAr:s.nameAr}))}/></div></details>
    </div>
    {placement&&<ProjectPlacement projectId={project.id} settings={readPortfolioSettings(placement[0])} projects={placement[1].map(p=>({id:p.id,primaryMediaType:p.primaryMediaType,primaryMediaUrl:p.primaryMediaUrl}))}/>}
    <details className="admin-card p-4"><summary className="cursor-pointer text-sm font-semibold text-foreground-muted">إجراءات إضافية</summary><div className="mt-3 flex flex-wrap gap-2">{published&&<><PreviewButton path={"/work/"+project.slug} label="معاينة التفاصيل"/><RowActionButton id={project.id} action={unpublishProjectAction} label="إلى مسودة" confirmMessage="إخفاء المشروع المنشور وإعادته لمسودة؟"/></>}<Link href={"/preview/project/"+project.id} target="_blank" rel="noopener noreferrer" className={button}>معاينة شكل العرض</Link><RowActionButton id={project.id} action={archiveProjectAction} label="أرشفة" confirmMessage="أرشفة المشروع وإخفاؤه من الموقع؟"/><Link href={"/admin/projects/new"+projectOriginQuery(origin)} className={button}>إضافة مشروع آخر</Link></div></details>
  </div>;
}
