import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectForm } from "@/components/admin/projects/project-form";
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
      <div className="admin-card p-4">
        <ProjectForm
          services={services
            .filter(s => s.isActive)
            .map(s => ({ id: s.id, nameAr: s.nameAr }))}
        />
      </div>
    </div>
  );
}
