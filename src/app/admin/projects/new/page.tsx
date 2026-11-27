import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuickProjectForm } from "@/components/admin/projects/quick-project-form";
import { listAdminServices } from "@/server/services/admin/service.admin.service";

export const metadata: Metadata = { title: "إضافة مشروع" };
export const dynamic = "force-dynamic";

export default async function NewAdminProjectPage() {
  await requireRole(AdminRole.EDITOR);
  const services = await listAdminServices();

  return (
    <div>
      <AdminPageHeader
        title="إضافة مشروع جديد"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الأعمال", href: "/admin/projects" },
          { label: "إضافة مشروع" },
        ]}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">{["01 · إنشاء المسودة","02 · رفع الأعمال واختيار الغلاف","03 · معاينة ونشر"].map((step,i)=><div key={step} className={"rounded-xl border p-4 text-sm font-semibold "+(i===0?"border-primary text-primary":"border-border text-foreground-muted")}>{step}</div>)}</div>
      <div>
        <QuickProjectForm
          services={services
            .filter(s => s.isActive)
            .map(s => ({ id: s.id, nameAr: s.nameAr }))}
        />
      </div>
    </div>
  );
}
