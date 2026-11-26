"use server";
import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import { BRAND_ASSETS_KEY, brandAssetsSchema } from "@/lib/content/brand-assets";
import { upsertSiteSetting } from "@/server/repositories/site-settings.repository";
import { revalidateSiteWide } from "@/server/services/revalidation.service";
export async function saveBrandAssetsAction(raw:unknown){
  return withAdminMutation({minimumRole:AdminRole.ADMIN,audit:result=>({action:"brand.assets.update",entityType:"SiteSetting",entityId:result.id})},async()=>{
    const assets=brandAssetsSchema.parse(raw);
    const row=await upsertSiteSetting(BRAND_ASSETS_KEY,assets,"Public header and footer logo");
    revalidateSiteWide();
    return {id:row.id};
  });
}
