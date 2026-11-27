import "server-only";
import {prisma} from "@/lib/db/prisma";
import {MEDIA_LIBRARY_KEY,readMediaRegistry,mergeMediaLibrary,type MediaAsset} from "@/lib/media/library";
import {BRAND_ASSETS_KEY,readBrandAssets} from "@/lib/content/brand-assets";
export async function listMediaLibrary(){
 const [registry,brand,media,covers,services,logos,quotes]=await Promise.all([
 prisma.siteSetting.findUnique({where:{key:MEDIA_LIBRARY_KEY},select:{value:true}}),
 prisma.siteSetting.findUnique({where:{key:BRAND_ASSETS_KEY},select:{value:true}}),
 prisma.projectMedia.findMany({where:{project:{deletedAt:null}},orderBy:{createdAt:"desc"},take:1500,select:{url:true,type:true,altText:true,thumbnailUrl:true,width:true,height:true,project:{select:{title:true}}}}),
 prisma.project.findMany({where:{deletedAt:null,coverImageUrl:{not:null}},orderBy:{updatedAt:"desc"},take:500,select:{title:true,coverImageUrl:true,coverImageAlt:true}}),
 prisma.service.findMany({where:{deletedAt:null,imageUrl:{not:null}},take:300,select:{nameAr:true,imageUrl:true}}),
 prisma.clientLogo.findMany({take:300,select:{name:true,logoUrl:true}}),
 prisma.testimonial.findMany({where:{deletedAt:null},take:300,select:{clientName:true,clientImageUrl:true,clientLogoUrl:true,screenshotUrl:true}})
 ]);
 const rows:Array<MediaAsset&{source:string}>=readMediaRegistry(registry?.value).map(item=>({...item,source:"المكتبة"}));
 function image(url:string|null|undefined,name:string,source:string,altText=""){if(url)rows.push({url,type:"IMAGE",name:name.slice(0,240),altText:altText.slice(0,240),thumbnailUrl:"",width:null,height:null,source});}
 for(const m of media)rows.push({url:m.url,type:m.type,name:m.project.title,altText:m.altText??"",thumbnailUrl:m.thumbnailUrl??"",width:m.width,height:m.height,source:"مشروع: "+m.project.title});
 for(const c of covers)image(c.coverImageUrl,c.title,"غلاف مشروع",c.coverImageAlt??"");
 for(const s of services)image(s.imageUrl,s.nameAr,"خدمة");
 for(const l of logos)image(l.logoUrl,l.name,"شعار عميل");
 for(const t of quotes){image(t.clientImageUrl,t.clientName,"رأي عميل");image(t.clientLogoUrl,t.clientName,"رأي عميل");image(t.screenshotUrl,t.clientName,"رأي عميل");}
 const b=readBrandAssets(brand?.value);image(b.headerLogo,"لوجو الهيدر","الهوية");image(b.footerLogo,"لوجو الفوتر","الهوية");
 return mergeMediaLibrary(rows);
}
