import Link from "next/link";
import { ContentStatus } from "@/generated/prisma";
import { ContentStatusBadge, ToneBadge } from "@/components/admin/status-badge";
import { listAdminTestimonials } from "@/server/services/admin/testimonial.admin.service";
import {
  CreateTestimonialDialog,
  EditTestimonialDialog,
} from "@/components/admin/testimonials/testimonial-form-dialogs";
import { ViewerReadonlyBanner } from "@/components/admin/content/content-helpers";

export async function TestimonialsPanel({ canEdit }: { canEdit: boolean }) {
  const testimonials = await listAdminTestimonials();

  return (
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            آراء العملاء
          </h2>
          <p className="text-sm text-foreground-muted">
            تأكد من موافقة العميل وإخفاء أي بيانات شخصية من الصور.
          </p>
        </div>
        {canEdit ? <CreateTestimonialDialog /> : null}
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        تأكد من موافقة العميل وإخفاء أي بيانات شخصية من الصور.
      </div>

      {testimonials.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-foreground-muted">
          لا توجد شهادات عملاء بعد.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map(item => (
            <article key={item.id} className="admin-card space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {item.clientName}
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    {item.projectName || "بدون مشروع"}
                    {item.industry ? ` · ${item.industry}` : ""}
                  </p>
                </div>
                <ContentStatusBadge status={item.status} />
              </div>
              <p className="line-clamp-3 text-sm text-foreground">
                “{item.quote}”
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {item.publicApprovalConfirmed ? (
                  <ToneBadge label="موافقة النشر مؤكدة" tone="success" />
                ) : (
                  <ToneBadge label="بانتظار موافقة النشر" tone="warning" />
                )}
                {canEdit ? <EditTestimonialDialog testimonial={item} /> : null}
                {item.status === ContentStatus.DRAFT &&
                !item.publicApprovalConfirmed ? (
                  <span className="text-xs text-amber-800">
                    لا يمكن النشر قبل تأكيد الموافقة
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        الصفحة المتقدمة:{" "}
        <Link
          href="/admin/testimonials"
          className="text-primary hover:underline"
        >
          إدارة الآراء
        </Link>
      </p>
    </div>
  );
}
