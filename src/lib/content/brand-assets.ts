import { z } from "zod";
import { isImageCandidate } from "../media/public-media";
export const BRAND_ASSETS_KEY="brand.assets";
function safeLogo(value:string){
  if(!value)return true;
  if(!isImageCandidate(value))return false;
  if(value.startsWith("/"))return /^\/brand\/[a-zA-Z0-9_./-]+\.(png|webp|jpg|jpeg|svg)$/i.test(value)&&!value.includes("..");
  try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password;}catch{return false;}
}
const logoUrl=z.string().trim().max(2048).refine(safeLogo,"استخدم رابط صورة HTTPS أو ملفًا من /brand");
export const brandAssetsSchema=z.object({headerLogo:logoUrl,footerLogo:logoUrl,headerWidth:z.number().int().min(72).max(240),showName:z.boolean()});
export type BrandAssets=z.infer<typeof brandAssetsSchema>;
export function defaultBrandAssets():BrandAssets{return {headerLogo:"",footerLogo:"",headerWidth:176,showName:false};}
export function readBrandAssets(raw:unknown):BrandAssets{const parsed=brandAssetsSchema.safeParse(raw);return parsed.success?parsed.data:defaultBrandAssets();}
