import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole, ContentStatus } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentStatusBadge, ToneBadge } from "@/components/admin/status-badge";
import { listAdminTestimonials } from "@/server/services/admin/testimonial.admin.service";
import {
  CreateTestimonialDialog,
  EditTestimonialDialog,
} from "@/components/admin/testimonials/testimonial-form-dialogs";
import { RowActionButton } from "@/components/admin/row-action-button";
import {
  archiveTestimonialAction,
  publishTestimonialAction,
  softDeleteTestimonialAction,
  unpublishTestimonialAction,
} from "@/server/actions/admin/testimonial.action";

export const metadata: Metadata = { title: "آراء العملاء" };
export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  await requireRole(AdminRole.VIEWER);
  const testimonials = await listAdminTestimonials();

  return (
    <div>
      <AdminPageHeader
        title="آراء العملاء"
        description="شهادات العملاء الظاهرة في قسم آراء العملاء"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "آراء العملاء" },
        ]}
        actions={<CreateTestimonialDialog />}
      />

      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>العميل</th>
              <th>الرأي</th>
              <th>الحالة</th>
              <th>موافقة النشر</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {testimonials.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد آراء بعد.
                </td>
              </tr>
            ) : (
              testimonials.map(testimonial => (
                <tr key={testimonial.id}>
                  <td>
                    <p className="font-medium text-foreground">
                      {testimonial.clientName}
                    </p>
                    {testimonial.projectName ? (
                      <p className="text-xs text-foreground-muted">
                        {testimonial.projectName}
                      </p>
                    ) : null}
                  </td>
                  <td className="max-w-sm">
                    <p className="truncate text-sm text-foreground-muted">
                      {testimonial.quote}
                    </p>
                  </td>
                  <td>
                    <ContentStatusBadge status={testimonial.status} />
                  </td>
                  <td>
                    <ToneBadge
                      label={
                        testimonial.publicApprovalConfirmed
                          ? "مؤكدة"
                          : "غير مؤكدة"
                      }
                      tone={
                        testimonial.publicApprovalConfirmed
                          ? "success"
                          : "warning"
                      }
                    />
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <EditTestimonialDialog testimonial={testimonial} />
                      {testimonial.status !== ContentStatus.PUBLISHED ? (
                        <RowActionButton
                          id={testimonial.id}
                          action={publishTestimonialAction}
                          label="نشر"
                          variant="primary"
                        />
                      ) : (
                        <RowActionButton
                          id={testimonial.id}
                          action={unpublishTestimonialAction}
                          label="إلى مسودة"
                        />
                      )}
                      <RowActionButton
                        id={testimonial.id}
                        action={archiveTestimonialAction}
                        label="أرشفة"
                      />
                      <RowActionButton
                        id={testimonial.id}
                        action={softDeleteTestimonialAction}
                        label="حذف"
                        variant="danger"
                        confirmMessage="حذف هذا الرأي؟ يمكن استرجاعه من قاعدة البيانات لاحقًا فقط."
                      />
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
