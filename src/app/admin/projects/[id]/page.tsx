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

  return (
    <div>
      <AdminPageHeader
        title={project.title}
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الأعمال", href: "/admin/projects" },
          { label: project.title },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ContentStatusBadge status={project.status} />
            <PreviewButton path={`/work/${project.slug}`} label="معاينة التفاصيل" />
            <Link href={"/preview/project/"+project.id} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-xs font-semibold">معاينة الـ Hero</Link>
            {project.status !== ContentStatus.PUBLISHED ? (
              <RowActionButton
                id={project.id}
                action={publishProjectAction}
                label="نشر"
                successHref={origin?artworkReturnHref(origin,project.id):undefined}
                confirmMessage="نشر المشروع للجمهور وإضافته إلى المعارض؟"
                disabled={!readyToPublish}
                variant="primary"
              />
            ) : (
              <RowActionButton
                id={project.id}
                action={unpublishProjectAction}
                label="إلى مسودة"
              />
            )}
            <RowActionButton
              id={project.id}
              action={archiveProjectAction}
              label="أرشفة"
            />
          </div>
        }
      />

      {origin&&<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><div><p className="font-bold">بتجهز شغل لقسم: {sectionNames[origin]}</p><p className="mt-1 text-foreground-muted">{project.status===ContentStatus.PUBLISHED?"المشروع منشور. ارجع للقسم عشان تختار عرضه.":"أضف التصميمات والغلاف، ثم انشر المشروع للعودة للقسم تلقائيًا."}</p></div><Link href={artworkReturnHref(origin,project.status===ContentStatus.PUBLISHED?project.id:undefined)} className="inline-flex min-h-11 items-center rounded-lg border border-primary px-4 font-semibold text-primary">العودة للقسم</Link></div>}
      <div className="mb-4 grid gap-2 sm:grid-cols-3">{[{label:"01 · البيانات",done:publishChecklist.slice(0,4).every(i=>i.ok),href:"#details"},{label:"02 · الوسائط والغلاف",done:publishChecklist.slice(4).every(i=>i.ok),href:"#media"},{label:"03 · النشر",done:project.status===ContentStatus.PUBLISHED,href:"#publish"}].map(step=><a key={step.label} href={step.href} className={"rounded-lg border p-3 text-sm "+(step.done?"border-primary/50 text-primary":"border-border text-foreground-muted")}>{step.done?"✓ ":""}{step.label}</a>)}</div>
      {project.status!==ContentStatus.PUBLISHED&&<div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-semibold text-primary">خطوتك التالية</p><h2 className="mt-1 font-bold">{!publishChecklist.slice(0,4).every(i=>i.ok)?"أكمل بيانات المشروع":!publishChecklist.slice(4).every(i=>i.ok)?"أضف التصميمات وحدد الغلاف":"راجع المشروع ثم انشره"}</h2><a href={!publishChecklist.slice(0,4).every(i=>i.ok)?"#details":!readyToPublish?"#media":"#publish"} className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">متابعة الخطوة</a></div>}
      <div id="publish" className="mb-4 scroll-mt-nav rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <p className="font-medium">
          جاهزية النشر: {readyToPublish ? "مكتمل" : "ناقص"}
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {publishChecklist.map(item => (
            <li
              key={item.label}
              className={item.ok ? "text-emerald-700" : "text-destructive"}
            >
              {item.ok ? "✓" : "✗"} {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4 grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[160px_1fr]"><div className="relative aspect-square overflow-hidden rounded-lg bg-muted"><ResilientImage src={project.coverImageUrl} alt={project.coverImageAlt || project.title} sizes="160px" /></div><div className="space-y-2"><h2 className="font-bold">معاينة الغلاف في الموقع</h2><p className="text-sm text-foreground-muted">أضف الوسائط ثم اختر صورة كغلاف. المشاريع المنشورة تظهر تلقائيًا في المعارض حسب الترتيب والتمييز.</p>{project.status===ContentStatus.PUBLISHED && <Link href={"/work/"+project.slug} target="_blank" className="text-sm text-primary underline">فتح صفحة المشروع المنشورة</Link>}</div></div>
      {project.status===ContentStatus.PUBLISHED&&<section className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><h2 className="font-bold text-emerald-800">المشروع منشور — الخطوة التالية</h2><p className="mt-1 text-sm leading-6 text-emerald-800">يمكن للزوار مشاهدة المشروع الآن. إذا كان الاختيار التلقائي مفعّلًا، يمكن أن يظهر في استعراض الموقع حسب ترتيبه.</p><div className="mt-3 flex flex-wrap gap-2">{["ADMIN","OWNER"].includes(user.role)&&<Link href="#placement" className="inline-flex min-h-10 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">اختيار ظهور المشروع في الواجهة</Link>}<Link href={"/admin/projects/new"+projectOriginQuery(origin)} className="inline-flex min-h-10 items-center rounded-lg border border-emerald-300 px-3 text-sm font-semibold text-emerald-800">إضافة مشروع آخر</Link>{["ADMIN","OWNER"].includes(user.role)&&<Link href="/admin/website" className="inline-flex min-h-10 items-center px-3 text-sm text-primary">العودة لإدارة الموقع</Link>}</div></section>}
      {placement&&<ProjectPlacement projectId={project.id} settings={readPortfolioSettings(placement[0])} projects={placement[1].map(p=>({id:p.id,primaryMediaType:p.primaryMediaType,primaryMediaUrl:p.primaryMediaUrl}))}/>}
      <div className="mt-4 flex flex-col gap-6">
        <div id="details" className={"admin-card scroll-mt-nav p-4 "+(!readyToPublish&&publishChecklist.slice(0,4).every(i=>i.ok)?"order-2":"order-1")}>
          <ProjectForm
            key={project.coverImageUrl || "no-cover"}
            project={project}
            services={services
              .filter(
                s =>
                  s.isActive ||
                  project.projectServices.some(ps => ps.serviceId === s.id)
              )
              .map(s => ({ id: s.id, nameAr: s.nameAr }))}
          />
        </div>

        <section id="media" className={"admin-card scroll-mt-nav space-y-3 p-4 "+(!readyToPublish&&publishChecklist.slice(0,4).every(i=>i.ok)?"order-1":"order-2")}>
          <h2 className="text-lg font-semibold">وسائط المشروع</h2>
          <ProjectMediaManager
            projectId={project.id}
            projectSlug={project.slug}
            media={project.media}
            coverImageUrl={project.coverImageUrl}
            canAutoCover={project.status===ContentStatus.DRAFT}
            cloudinaryConfigured={isCloudinaryConfigured()}
          />
        </section>
      </div>
    </div>
  );
}
