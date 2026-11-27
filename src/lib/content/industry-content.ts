import {z} from "zod";
import {niches} from "./niches";
import {isImageCandidate} from "../media/public-media";
export const industryIds=["salons","teachers","teachers-books"] as const;
export type IndustryId=typeof industryIds[number];
const imageUrl=z.string().trim().max(2048).refine(v=>!v||(isImageCandidate(v)&&(/^(https:\/\/|\/[^/])/.test(v))&&!v.startsWith("/api/")),"اختر رابط صورة HTTPS أو صورة من المكتبة");
const card=z.object({label:z.string().trim().min(1).max(120),eyebrow:z.string().trim().max(120),imageUrl,imageAlt:z.string().trim().max(200)});
export const industryContentSchema=z.object({kicker:z.string().trim().max(100),title:z.string().trim().min(1).max(150),highlight:z.string().trim().max(100),description:z.string().trim().max(600),order:z.array(z.enum(industryIds)).length(3).refine(v=>new Set(v).size===3),cards:z.object({salons:card,teachers:card,"teachers-books":card})});
export type IndustryContent=z.infer<typeof industryContentSchema>;
export function defaultIndustryContent():IndustryContent{
 const cards=Object.fromEntries(niches.map(n=>[n.slug,{label:n.label,eyebrow:n.eyebrow,imageUrl:"",imageAlt:""}])) as IndustryContent["cards"];
 return {kicker:"INDUSTRY FOCUS",title:"تسويق يفهم",highlight:"مجالك.",description:"حلول متخصصة للصالونات والمدرسين، ومحتوى بصري مبني على احتياج كل نشاط.",order:[...industryIds],cards};
}
export function industryChangedFields(a:IndustryContent,b:IndustryContent){
 const changes:Array<{key:string;before:string;after:string}>=[];
 for(const key of ["kicker","title","highlight","description"] as const)if(a[key]!==b[key])changes.push({key:"مجالاتنا / "+key,before:a[key],after:b[key]});
 if(a.order.join()!==b.order.join())changes.push({key:"مجالاتنا / ترتيب البطاقات",before:a.order.map(id=>a.cards[id].label).join("، "),after:b.order.map(id=>b.cards[id].label).join("، ")});
 for(const id of industryIds)for(const key of ["label","eyebrow","imageUrl","imageAlt"] as const)if(a.cards[id][key]!==b.cards[id][key])changes.push({key:"مجالاتنا / "+id+" / "+key,before:a.cards[id][key],after:b.cards[id][key]});
 return changes;
}
