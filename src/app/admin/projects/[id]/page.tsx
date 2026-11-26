import Link from "next/link";
import { ResilientImage } from "@/components/ui/resilient-media";
import { isImageCandidate } from "@/lib/media/public-media";
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
import { isCloudinaryConfigured } from "@/lib/env/server";

export const metadata: Metadata = { title: "تعديل مشروع" };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditAdminProjectPage({ params }: PageProps) {
  await requireRole(AdminRole.EDITOR);
  const { id } = await params;
  const [project, services] = await Promise.all([
    getAdminProjectById(id),
    listAdminServices(),
  ]);

  if (!project) notFound();

  const publishChecklist = [
    { label: "العنوان", ok: Boolean(project.title.trim()) },
    { label: "الرابط", ok: Boolean(project.slug.trim()) },
    { label: "المجال", ok: Boolean(project.industry?.trim()) },
    { label: "الملخص", ok: Boolean(project.summary.trim()) },
    { label: "صورة الغلاف", ok: isImageCandidate(project.coverImageUrl) },
    { label: "النص البديل للغلاف", ok: Boolean(project.coverImageAlt?.trim()) },
  ];
  const readyToPublish = publishChecklist.every(item => item.ok);

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
            <PreviewButton path={`/work/${project.slug}`} />
            {project.status !== ContentStatus.PUBLISHED ? (
              <RowActionButton
                id={project.id}
                action={publishProjectAction}
                label="نشر"
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

      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
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
      <div className="space-y-6">
        <div className="admin-card p-4">
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

        <section className="admin-card space-y-3 p-4">
          <h2 className="text-lg font-semibold">وسائط المشروع</h2>
          <ProjectMediaManager
            projectId={project.id}
            projectSlug={project.slug}
            media={project.media}
            coverImageUrl={project.coverImageUrl}
            cloudinaryConfigured={isCloudinaryConfigured()}
          />
        </section>
      </div>
    </div>
  );
}
