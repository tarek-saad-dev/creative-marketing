import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ToneBadge } from "@/components/admin/status-badge";
import { listAdminFaqs } from "@/server/services/admin/faq.admin.service";
import {
  CreateFaqDialog,
  EditFaqDialog,
} from "@/components/admin/faqs/faq-form-dialogs";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { deleteFaqAction } from "@/server/actions/admin/faq.action";

export const metadata: Metadata = { title: "الأسئلة الشائعة" };
export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  await requireRole(AdminRole.VIEWER);
  const faqs = await listAdminFaqs();

  return (
    <div>
      <AdminPageHeader
        title="الأسئلة الشائعة"
        description="الأسئلة الظاهرة في قسم الأسئلة الشائعة بالصفحة الرئيسية"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الأسئلة الشائعة" },
        ]}
        actions={<CreateFaqDialog />}
      />

      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>السؤال</th>
              <th>التصنيف</th>
              <th>فعّال</th>
              <th>الترتيب</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {faqs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد أسئلة بعد.
                </td>
              </tr>
            ) : (
              faqs.map(faq => (
                <tr key={faq.id}>
                  <td className="max-w-md">
                    <p className="font-medium text-foreground">
                      {faq.question}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">
                      {faq.answer}
                    </p>
                  </td>
                  <td>{faq.category ?? "—"}</td>
                  <td>
                    <ToneBadge
                      label={faq.isActive ? "نعم" : "لا"}
                      tone={faq.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td>{faq.displayOrder}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <EditFaqDialog faq={faq} />
                      <DeleteRowButton id={faq.id} action={deleteFaqAction} />
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
