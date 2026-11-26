import type { Metadata } from "next";
import { AdminRole } from "@/generated/prisma";
import { requireRole } from "@/server/auth/require-admin";
import { getSiteSettingByKey } from "@/server/repositories/site-settings.repository";
import { getPublishedShowcaseProjects } from "@/server/services/project.service";
import { PORTFOLIO_SETTING_KEY, readPortfolioSettings } from "@/lib/content/portfolio-settings";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PortfolioControlForm } from "@/components/admin/projects/portfolio-control-form";
export const metadata:Metadata={title:"التحكم في معرض الأعمال"};
export const dynamic="force-dynamic";
export default async function PortfolioAdmin(){
  await requireRole(AdminRole.ADMIN);
  const [raw,projects]=await Promise.all([getSiteSettingByKey(PORTFOLIO_SETTING_KEY),getPublishedShowcaseProjects()]);
  return <div className="space-y-6"><AdminPageHeader title="التحكم في استعراض الأعمال" description="اختيار المشاريع وترتيبها وإظهار أقسام المعرض في الصفحة الرئيسية." breadcrumbs={[{label:"لوحة التحكم",href:"/admin"},{label:"استعراض الأعمال"}]}/><PortfolioControlForm initial={readPortfolioSettings(raw)} projects={projects}/></div>;
}
