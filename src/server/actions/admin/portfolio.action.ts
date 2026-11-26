"use server";
import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import { portfolioSettingsSchema, portfolioSections, PORTFOLIO_SETTING_KEY } from "@/lib/content/portfolio-settings";
import { upsertSiteSetting } from "@/server/repositories/site-settings.repository";
import { getPublishedShowcaseProjects } from "@/server/services/project.service";
import { revalidateHomepage } from "@/server/services/revalidation.service";

export async function savePortfolioSettingsAction(raw:unknown){
  return withAdminMutation({minimumRole:AdminRole.ADMIN,audit:result=>({action:"portfolio.settings.update",entityType:"SiteSetting",entityId:result.id})},async()=>{
    const settings=portfolioSettingsSchema.parse(raw);
    const projects=await getPublishedShowcaseProjects();
    const byId=new Map(projects.map(p=>[p.id,p]));
    for(const slot of portfolioSections){
      const ids=settings[slot.key].ids;
      if(ids.length>slot.limit || new Set(ids).size!==ids.length)throw new Error("راجع عدد وترتيب المشاريع في "+slot.label);
      // Stale IDs may be removed, but never newly saved.
      if(ids.some(id=>!byId.has(id)))throw new Error("يوجد مشروع غير منشور ضمن الاختيارات. أزله ثم احفظ.");
      if(slot.key==="reel"&&ids.some(id=>byId.get(id)?.primaryMediaType!=="VIDEO"||!byId.get(id)?.primaryMediaUrl))throw new Error("اختر مشروعًا يبدأ بفيديو لعرض الفيديو");
    }
    // Prune old overrides when a project is unpublished; never expose unpublished projects.
    settings.mockups=Object.fromEntries(Object.entries(settings.mockups).filter(([id,choice])=>byId.has(id)&&choice!=="auto"));
    if(Object.keys(settings.mockups).length>500)throw new Error("عدد إعدادات العرض أكبر من الحد المسموح");
    const row=await upsertSiteSetting(PORTFOLIO_SETTING_KEY,settings,"Homepage portfolio controls");
    revalidateHomepage();
    return {id:row.id};
  });
}
