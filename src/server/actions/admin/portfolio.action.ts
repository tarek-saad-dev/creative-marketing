"use server";
import { AdminRole } from "@/generated/prisma";
import { withAdminMutation } from "@/server/auth/admin-mutation";
import { portfolioSettingsSchema, portfolioSections, PORTFOLIO_SETTING_KEY,readPortfolioSettings,planProjectPlacement } from "@/lib/content/portfolio-settings";
import {prisma} from "@/lib/db/prisma";
import {publishedProjectWhere,publishedProjectOrderBy,projectCardSelect} from "@/server/repositories/project-publication";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import { getPublishedShowcaseProjects } from "@/server/services/project.service";
import { revalidateHomepage } from "@/server/services/revalidation.service";

export async function savePortfolioSettingsAction(raw:unknown,expected:unknown){
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
    const previous=portfolioSettingsSchema.parse(expected);
    const row=await prisma.$transaction(async tx=>{const current=await tx.siteSetting.findUnique({where:{key:PORTFOLIO_SETTING_KEY}});if(JSON.stringify(readPortfolioSettings(current?.value))!==JSON.stringify(previous))throw new Error("تم تعديل إعدادات العرض من مكان آخر. أعد تحميل الصفحة.");return tx.siteSetting.upsert({where:{key:PORTFOLIO_SETTING_KEY},create:{key:PORTFOLIO_SETTING_KEY,value:settings,description:"Homepage portfolio controls"},update:{value:settings}});},{isolationLevel:"Serializable"});
    revalidateHomepage();
    return {id:row.id};
  });
}

export async function promoteProjectInPortfolioAction(raw:unknown){
 return withAdminMutation({minimumRole:AdminRole.ADMIN,audit:r=>({action:"portfolio.project.promote",entityType:"Project",entityId:r.projectId,metadata:{slot:r.slot,changed:r.changed}})},async()=>{
 const input=z.object({projectId:z.string().min(1).max(160),slot:z.enum(["hero","stream","selected","device","reel"]),expected:portfolioSettingsSchema}).parse(raw);
 const result=await prisma.$transaction(async tx=>{
 const row=await tx.siteSetting.findUnique({where:{key:PORTFOLIO_SETTING_KEY}}),settings=readPortfolioSettings(row?.value);
 if(JSON.stringify(settings)!==JSON.stringify(input.expected))throw new Error("تغيرت إعدادات العرض. أعد تحميل الصفحة.");
 const projects=(await tx.project.findMany({where:publishedProjectWhere(),orderBy:[{featured:"desc"},...publishedProjectOrderBy],select:projectCardSelect})).map(p=>({id:p.id,primaryMediaType:p.media[0]?.type,primaryMediaUrl:p.media[0]?.url}));
 const plan=planProjectPlacement(projects,settings,input.slot,input.projectId);
 if(plan.changed){const next={...settings,[input.slot]:{...settings[input.slot],ids:plan.ids}};await tx.siteSetting.upsert({where:{key:PORTFOLIO_SETTING_KEY},create:{key:PORTFOLIO_SETTING_KEY,value:next,description:"Homepage portfolio controls"},update:{value:next}});}
 return {projectId:input.projectId,slot:input.slot,changed:plan.changed};
 },{isolationLevel:"Serializable"});
 revalidateHomepage();revalidatePath("/admin/portfolio");revalidatePath("/admin/website");revalidatePath("/admin/projects/"+input.projectId);return result;
 });
}
