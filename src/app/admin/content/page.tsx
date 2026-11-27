import type { Metadata } from "next";
import Link from "next/link";
import {redirect} from "next/navigation";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ContentSectionNav } from "@/components/admin/content/content-section-nav";
import { ContentQuickStatus } from "@/components/admin/content/content-helpers";
import { CmsOverview } from "@/components/admin/content/cms-overview";
import { SettingsPanel } from "@/components/admin/content/settings-panel";
import { ServicesPanel } from "@/components/admin/content/services-panel";
import { PackagesPanel } from "@/components/admin/content/packages-panel";
import { OffersPanel } from "@/components/admin/content/offers-panel";
import { TestimonialsPanel } from "@/components/admin/content/testimonials-panel";
import { TrustPanel } from "@/components/admin/content/trust-panel";
import { LogosPanel } from "@/components/admin/content/logos-panel";
import { FaqsPanel } from "@/components/admin/content/faqs-panel";
import {
  CONTENT_SECTIONS,
  parseContentSection,
} from "@/lib/admin/content-sections";
import { canEditCommercial, canEditContent } from "@/lib/admin/roles";
import { getAdminDashboardData } from "@/server/services/admin/dashboard.admin.service";

export const metadata: Metadata = { title: "إدارة محتوى الموقع" };
export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string;status?:string;edit?:string;new?:string }>;
}) {
  const user = await requireRole(AdminRole.VIEWER);
  const sp = await searchParams;
  const section = parseContentSection(sp.section);
  if(section==="projects")redirect("/admin/projects");
  const sectionMeta = CONTENT_SECTIONS.find(s => s.id === section)!;
  const canEdit = canEditContent(user.role);
  const canCommercial = canEditCommercial(user.role);
  const data = section==="overview"?await getAdminDashboardData():null;

  return (
    <div>
      <AdminPageHeader
        title={section==="overview"?"مركز المحتوى":sectionMeta.label}
        description={section==="overview"?"اختر نوع المحتوى الذي تريد إدارته.":sectionMeta.description}
        actions={canCommercial?<Link href="/admin/website" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-primary">العودة لإدارة الموقع</Link>:undefined}
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "مركز المحتوى",href:section==="overview"?undefined:"/admin/content" },
          ...(section==="overview"?[]:[{label:sectionMeta.label}]),
        ]}
      />

      {data&&<ContentQuickStatus
        items={[
          {
            label: "مشاريع منشورة",
            value: data.counts.projectsPublished,
            href: "/admin/projects",
          },
          {
            label: "باكدجات منشورة",
            value: data.counts.packagesPublished,
            href: "/admin/content?section=packages",
          },
          {
            label: "عروض نشطة",
            value: data.counts.offersActive,
            href: "/admin/content?section=offers",
          },
          {
            label: "طلبات جديدة",
            value: data.counts.leadsNew,
            href: "/admin/leads",
          },
        ]}
      />}

      <ContentSectionNav active={section} />



      {data&&<CmsOverview data={data} canCommercial={canCommercial} canEdit={canEdit}/>}
      {section === "settings" ? (
        <SettingsPanel canEdit={canCommercial} />
      ) : null}

      {section === "services" ? <ServicesPanel canEdit={canEdit} canArchive={canCommercial} /> : null}
      {section === "packages" ? (
        <PackagesPanel canEdit={canEdit} canPublish={canCommercial} filter={["all","PUBLISHED","DRAFT","ARCHIVED","incomplete"].includes(sp.status??"")?sp.status:"all"} editId={sp.edit} newPackage={sp.new==="1"} />
      ) : null}
      {section === "offers" ? <OffersPanel canEdit={canCommercial} editId={sp.edit} newOffer={sp.new==="1"} /> : null}
      {section === "testimonials" ? (
        <TestimonialsPanel canEdit={canEdit} />
      ) : null}
      {section === "trust" ? <TrustPanel canEdit={canEdit} /> : null}
      {section === "logos" ? <LogosPanel canEdit={canEdit} /> : null}
      {section === "faqs" ? <FaqsPanel canEdit={canEdit} /> : null}
    </div>
  );
}
