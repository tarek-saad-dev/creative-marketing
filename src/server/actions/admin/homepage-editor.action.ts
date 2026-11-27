"use server";
import {AdminRole} from "@/generated/prisma";
import {withAdminMutation} from "@/server/auth/admin-mutation";
import {getCurrentAdmin} from "@/server/auth/require-admin";
import {prisma} from "@/lib/db/prisma";
import {HOMEPAGE_EDITOR_KEY,homeEditorMutationSchema,readHomeEditor,applyHomeEditorMutation} from "@/lib/content/homepage-editor";
import {revalidateHomepage} from "@/server/services/revalidation.service";
import {revalidatePath} from "next/cache";
export async function updateHomepageEditorAction(raw:unknown){
 return withAdminMutation({minimumRole:AdminRole.ADMIN,audit:result=>({action:"homepage."+result.action,entityType:"SiteSetting",entityId:result.id,metadata:{revision:result.state.revision}})},async()=>{
  const admin=await getCurrentAdmin();if(!admin||!["ADMIN","OWNER"].includes(admin.role))throw new Error("ليس لديك صلاحية لتعديل الصفحة");
  const input=homeEditorMutationSchema.parse(raw);
  const result=await prisma.$transaction(async tx=>{
    const current=await tx.siteSetting.findUnique({where:{key:HOMEPAGE_EDITOR_KEY}});
    const state=applyHomeEditorMutation(readHomeEditor(current?.value),input);
    const row=await tx.siteSetting.upsert({where:{key:HOMEPAGE_EDITOR_KEY},create:{key:HOMEPAGE_EDITOR_KEY,value:state,description:"Homepage draft and published layout"},update:{value:state}});
    return {id:row.id,state,action:input.action};
  },{isolationLevel:"Serializable"}).catch(error=>{if(error&&typeof error==="object"&&"code" in error&&["P2034","P2002"].includes(String(error.code)))throw new Error("حدث تعديل متزامن. أعد تحميل الصفحة.");throw error;});
  if(input.action==="publish")revalidateHomepage();
  revalidatePath("/admin/pages");revalidatePath("/preview/homepage");
  return result;
 });
}
