import Link from "next/link";
import { listAdminServices } from "@/server/services/admin/service.admin.service";
import { CreateServiceDialog } from "@/components/admin/services/service-form-dialog";
import { ServicesGroupedPanel } from "@/components/admin/content/services-grouped-panel";
import { ViewerReadonlyBanner } from "@/components/admin/content/content-helpers";

export async function ServicesPanel({ canEdit }: { canEdit: boolean }) {
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
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            الخدمات
          </h2>
          <p className="text-sm text-foreground-muted">
            أربع مجموعات واضحة — فعّل أو عدّل أو أعد الترتيب بدون تفاصيل تقنية.
          </p>
        </div>
        {canEdit ? <CreateServiceDialog /> : null}
      </div>

      <ServicesGroupedPanel services={listItems} readOnly={!canEdit} />

      <p className="text-xs text-foreground-muted">
        الصفحة المتقدمة:{" "}
        <Link href="/admin/services" className="text-primary hover:underline">
          إدارة الخدمات
        </Link>
      </p>
    </div>
  );
}
