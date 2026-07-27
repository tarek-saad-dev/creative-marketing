import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminServices } from "@/server/services/admin/service.admin.service";
import { CreateServiceDialog } from "@/components/admin/services/service-form-dialog";
import { ServicesAdminTable } from "@/components/admin/services/services-admin-table";

export const metadata: Metadata = { title: "الخدمات" };
export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await requireRole(AdminRole.VIEWER);
  const services = await listAdminServices();

  const listItems = services.map(service => ({
    id: service.id,
    slug: service.slug,
    nameAr: service.nameAr,
    nameEn: service.nameEn,
    category: service.category,
    summaryAr: service.summaryAr,
    summaryEn: service.summaryEn,
    descriptionAr: service.descriptionAr,
    descriptionEn: service.descriptionEn,
    icon: service.icon,
    imageUrl: service.imageUrl,
    isActive: service.isActive,
    displayOrder: service.displayOrder,
    projectCount: service._count.projectServices,
  }));

  return (
    <div>
      <AdminPageHeader
        title="الخدمات"
        description="خدمات الوكالة الظاهرة ضمن منظومة الخدمات في الصفحة الرئيسية"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الخدمات" },
        ]}
        actions={<CreateServiceDialog />}
      />

      <ServicesAdminTable services={listItems} />
    </div>
  );
}
