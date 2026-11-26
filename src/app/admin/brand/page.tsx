import type { Metadata } from "next";
import { AdminRole } from "@/generated/prisma";
import { requireRole } from "@/server/auth/require-admin";
import { getAllSiteSettings } from "@/server/repositories/site-settings.repository";
import { BRAND_ASSETS_KEY, readBrandAssets } from "@/lib/content/brand-assets";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrandAssetsForm } from "@/components/admin/settings/brand-assets-form";
import { isCloudinaryConfigured } from "@/lib/env/server";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"الهوية واللوجو"};
export default async function BrandPage(){
  await requireRole(AdminRole.ADMIN);
  const settings=await getAllSiteSettings();
  const name=typeof settings["brand.name"]==="string"&&settings["brand.name"]?settings["brand.name"]:"Creative Marketing";
  return <div className="space-y-6"><AdminPageHeader title="الهوية واللوجو" description="رفع اللوجو الرسمي ومعاينته على خلفية الموقع قبل الحفظ." breadcrumbs={[{label:"لوحة التحكم",href:"/admin"},{label:"الهوية واللوجو"}]}/><BrandAssetsForm initial={readBrandAssets(settings[BRAND_ASSETS_KEY])} brandName={name} cloudinaryConfigured={isCloudinaryConfigured()}/></div>;
}
