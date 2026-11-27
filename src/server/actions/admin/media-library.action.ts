"use server";
import {AdminRole} from "@/generated/prisma";
import {withAdminMutation} from "@/server/auth/admin-mutation";
import {getCurrentAdmin} from "@/server/auth/require-admin";
import {listMediaLibrary} from "@/server/services/admin/media-library.service";
import {prisma} from "@/lib/db/prisma";
import {getCloudinaryEnv} from "@/lib/env/server";
import {mediaAssetSchema,MEDIA_LIBRARY_KEY,readMediaRegistry,isLibraryUploadUrl} from "@/lib/media/library";
import {revalidatePath} from "next/cache";
async function requireLiveEditor(){const user=await getCurrentAdmin();if(!user||user.role==="VIEWER")throw new Error("ليس لديك صلاحية إدارة الوسائط");}
export async function listMediaLibraryAction(){return withAdminMutation({minimumRole:AdminRole.EDITOR},async()=>{await requireLiveEditor();return listMediaLibrary();});}
export async function registerMediaUploadAction(raw:unknown){
 return withAdminMutation({minimumRole:AdminRole.EDITOR,audit:r=>({action:"media.register",entityType:"SiteSetting",entityId:r.id})},async()=>{
 await requireLiveEditor();
 const asset=mediaAssetSchema.parse(raw);
 if(!isLibraryUploadUrl(asset.url,getCloudinaryEnv().cloudName,asset.type))throw new Error("رابط الرفع لا ينتمي إلى مكتبة الموقع");
 const row=await prisma.$transaction(async tx=>{
  const existing=await tx.siteSetting.findUnique({where:{key:MEDIA_LIBRARY_KEY}});
  const items=readMediaRegistry(existing?.value);
  if(items.some(i=>i.url===asset.url)&&existing)return existing;
  if(items.length>=500)throw new Error("وصلت المكتبة المستقلة إلى حد 500 ملف");
  const value=[asset,...items];
  return tx.siteSetting.upsert({where:{key:MEDIA_LIBRARY_KEY},create:{key:MEDIA_LIBRARY_KEY,value,description:"Admin media registry"},update:{value}});
 },{isolationLevel:"Serializable"}).catch(error=>{if(error&&typeof error==="object"&&"code" in error&&["P2034","P2002"].includes(String(error.code)))throw new Error("حدث رفع متزامن؛ أعد تسجيل الملف.");throw error;});
 revalidatePath("/admin/media");return {id:row.id,asset};
 });
}
