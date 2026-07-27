import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole, ContentStatus } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusBadge, ToneBadge } from "@/components/admin/status-badge";
import { listAdminProjects } from "@/server/services/admin/project.admin.service";
import { RowActionButton } from "@/components/admin/row-action-button";
import { PreviewButton } from "@/components/admin/preview-button";
import {
  archiveProjectAction,
  publishProjectAction,
  restoreProjectAction,
  softDeleteProjectAction,
  unpublishProjectAction,
} from "@/server/actions/admin/project.action";

export const metadata: Metadata = { title: "الأعمال" };
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireRole(AdminRole.VIEWER);
  const projects = await listAdminProjects({ includeDeleted: true });

  return (
    <div>
      <AdminPageHeader
        title="الأعمال"
        description="معرض أعمال الوكالة الظاهر في صفحة الأعمال والصفحة الرئيسية"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الأعمال" },
        ]}
        actions={
          <Link
            href="/admin/projects/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            إضافة مشروع
          </Link>
        }
      />

      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>المشروع</th>
              <th>الوسائط</th>
              <th>الحالة</th>
              <th>محذوف</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد مشاريع بعد.
                </td>
              </tr>
            ) : (
              projects.map(project => (
                <tr key={project.id}>
                  <td>
                    <p className="font-medium text-foreground">
                      {project.title}
                    </p>
                    <p className="text-xs text-foreground-muted" dir="ltr">
                      /work/{project.slug}
                    </p>
                  </td>
                  <td>{project._count.media}</td>
                  <td>
                    <ContentStatusBadge status={project.status} />
                  </td>
                  <td>
                    {project.deletedAt ? (
                      <ToneBadge label="محذوف" tone="danger" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold text-primary hover:bg-primary/10"
                      >
                        تعديل
                      </Link>
                      {!project.deletedAt ? (
                        <>
                          {project.status === ContentStatus.PUBLISHED ? (
                            <PreviewButton path={`/work/${project.slug}`} />
                          ) : null}
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
                          <RowActionButton
                            id={project.id}
                            action={softDeleteProjectAction}
                            label="حذف"
                            variant="danger"
                            confirmMessage="حذف هذا المشروع؟"
                          />
                        </>
                      ) : (
                        <RowActionButton
                          id={project.id}
                          action={restoreProjectAction}
                          label="استعادة"
                          variant="primary"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
