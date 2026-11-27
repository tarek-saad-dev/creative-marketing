import {z} from "zod";
import {isUsableMediaUrl,isImageCandidate,videoPoster} from "./public-media";
export const MEDIA_LIBRARY_KEY="admin.media.library";
export const mediaAssetSchema=z.object({url:z.string().trim().max(1000).refine(isUsableMediaUrl),type:z.enum(["IMAGE","VIDEO"]),name:z.string().trim().min(1).max(240),altText:z.string().trim().max(240).default(""),thumbnailUrl:z.string().trim().max(1000).refine(v=>!v||isImageCandidate(v)).default(""),width:z.number().int().positive().nullable().default(null),height:z.number().int().positive().nullable().default(null)}).refine(v=>v.type!=="IMAGE"||isImageCandidate(v.url),"رابط الصورة غير صالح");
export type MediaAsset=z.infer<typeof mediaAssetSchema>;
export type MediaLibraryItem=MediaAsset&{sources:string[]};
export function readMediaRegistry(raw:unknown):MediaAsset[]{if(!Array.isArray(raw))return [];return raw.flatMap(item=>{const parsed=mediaAssetSchema.safeParse(item);return parsed.success?[parsed.data]:[];});}
export function mergeMediaLibrary(rows:Array<MediaAsset&{source:string}>):MediaLibraryItem[]{
 const byUrl=new Map<string,MediaLibraryItem>();
 for(const {source,...raw} of rows){const parsed=mediaAssetSchema.safeParse(raw);if(!parsed.success)continue;const item=parsed.data;const old=byUrl.get(item.url);if(old){if(!old.sources.includes(source))old.sources.push(source);if(!old.altText)old.altText=item.altText;if(!old.thumbnailUrl)old.thumbnailUrl=item.thumbnailUrl;if(!old.width)old.width=item.width;if(!old.height)old.height=item.height;}else byUrl.set(item.url,{...item,sources:[source]});}
 return [...byUrl.values()];
}
export function libraryPreview(item:MediaAsset){return item.type==="VIDEO"?videoPoster(item.url,item.thumbnailUrl):item.url;}
export function isLibraryUploadUrl(url:string,cloudName:string,type:MediaAsset["type"]){
 try{const u=new URL(url);const segments=u.pathname.split("/").filter(Boolean);return u.protocol==="https:"&&u.hostname==="res.cloudinary.com"&&!u.username&&!u.password&&segments[0]===cloudName&&segments[1]===(type==="IMAGE"?"image":"video")&&segments[2]==="upload"&&/^v\d+$/.test(segments[3]??"")&&segments[4]==="creative-marketing"&&segments[5]==="library"&&segments.length>=7;}catch{return false;}
}
