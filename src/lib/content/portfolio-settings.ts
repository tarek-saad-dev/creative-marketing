import { z } from "zod";

export const PORTFOLIO_SETTING_KEY = "landing.portfolio";
export const portfolioSections = [
  {key:"hero",label:"Hero / 3D Coverflow",limit:12,minimum:1},
  {key:"stream",label:"Creative Stream / Infinite Carousel",limit:8,minimum:3},
  {key:"selected",label:"Selected Projects",limit:6,minimum:1},
  {key:"device",label:"Smartphone Showcase",limit:6,minimum:2},
  {key:"reel",label:"Video Showreel",limit:1,minimum:1},
] as const;
export type PortfolioSlot = typeof portfolioSections[number]["key"];
const choices = z.array(z.string().min(1).max(160)).max(12);
const slotSchema = z.object({enabled:z.boolean(),ids:choices});
export const portfolioSettingsSchema = z.object({
  hero:slotSchema,stream:slotSchema,selected:slotSchema,device:slotSchema,reel:slotSchema,
  gallery:z.boolean(),comparisons:z.boolean(),
});
export type PortfolioSettings = z.infer<typeof portfolioSettingsSchema>;
export function defaultPortfolioSettings():PortfolioSettings{
  return {hero:{enabled:true,ids:[]},stream:{enabled:true,ids:[]},selected:{enabled:true,ids:[]},device:{enabled:true,ids:[]},reel:{enabled:true,ids:[]},gallery:true,comparisons:true};
}
export function readPortfolioSettings(raw:unknown):PortfolioSettings {
  const parsed=portfolioSettingsSchema.safeParse(raw);
  return parsed.success?parsed.data:defaultPortfolioSettings();
}
export function selectPortfolioProjects<T extends {id:string;primaryMediaType?:string|null;primaryMediaUrl?:string|null}>(projects:T[],settings:PortfolioSettings,slot:PortfolioSlot):T[]{
  const config=settings[slot];
  if(!config.enabled)return [];
  const meta=portfolioSections.find(item=>item.key===slot)!;
  const candidates=slot==="reel"?projects.filter(p=>p.primaryMediaType==="VIDEO"&&p.primaryMediaUrl):projects;
  if(!config.ids.length)return candidates.slice(0,meta.limit);
  const byId=new Map(candidates.map(p=>[p.id,p]));
  return [...new Set(config.ids)].flatMap(id=>{const item=byId.get(id);return item?[item]:[]}).slice(0,meta.limit);
}
