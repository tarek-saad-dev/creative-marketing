import Link from "next/link";
import { Plus } from "lucide-react";
import { ContentStatus } from "@/generated/prisma";
import { ContentStatusBadge } from "@/components/admin/status-badge";
import { PreviewButton } from "@/components/admin/preview-button";
import { listAdminProjects } from "@/server/services/admin/project.admin.service";
import { isUsableMediaUrl } from "@/lib/media/public-media";
import { ViewerReadonlyBanner } from "@/components/admin/content/content-helpers";

function isVisuallyReady(project: {
  title: string;
  industry: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
}): boolean {
  return (
    Boolean(project.title?.trim()) &&
    Boolean(project.industry?.trim()) &&
    isUsableMediaUrl(project.coverImageUrl) &&
    Boolean(project.coverImageAlt?.trim())
  );
}

export async function ProjectsPanel({ canEdit }: { canEdit: boolean }) {
  const projects = await listAdminProjects({ includeDeleted: false });

  return (
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            المشاريع
          </h2>
          <p className="text-sm text-foreground-muted">
            أضف مشاريعك بمعرض بصري واضح — بدون تفاصيل تقنية.
          </p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/projects/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            إضافة مشروع جديد
          </Link>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-foreground-muted">
          لا توجد مشاريع بعد.
          {canEdit ? (
            <div className="mt-3">
              <Link
                href="/admin/projects/new"
                className="font-semibold text-primary hover:underline"
              >
                أضف أول مشروع
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map(project => {
            const ready = isVisuallyReady(project);
            return (
              <article key={project.id} className="admin-card overflow-hidden">
                <div className="aspect-[16/10] bg-muted">
                  {isUsableMediaUrl(project.coverImageUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.coverImageUrl}
                      alt={project.coverImageAlt || project.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-foreground-muted">
                      بدون غلاف
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {project.title}
                      </h3>
                      <p className="text-xs text-foreground-muted">
                        {project.industry || "بدون مجال"}
                        {project.clientName ? ` · ${project.clientName}` : ""}
                      </p>
                    </div>
                    <ContentStatusBadge status={project.status} />
                  </div>

                  <p className="text-xs text-foreground-muted">
                    {ready ? (
                      <span className="text-emerald-700">جاهز للنشر ✓</span>
                    ) : (
                      <span className="text-amber-700">
                        يحتاج إكمال البيانات قبل النشر
                      </span>
                    )}
                    {" · "}
                    {project._count.media} وسائط
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground"
                    >
                      تعديل
                    </Link>
                    {project.status === ContentStatus.PUBLISHED ||
                    project.status === ContentStatus.DRAFT ? (
                      <PreviewButton
                        path={`/work/${project.slug}`}
                        label="معاينة المشروع"
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        للمحرر المتقدم:{" "}
        <Link href="/admin/projects" className="text-primary hover:underline">
          قائمة المشاريع الكاملة
        </Link>
      </p>
    </div>
  );
}
