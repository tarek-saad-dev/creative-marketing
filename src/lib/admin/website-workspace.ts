import {homeSectionMeta,type HomeSectionId} from "../content/homepage-editor";
import type {PortfolioSlot} from "../content/portfolio-settings";
export type WorkspaceTab="content"|"artwork"|"layout"|"logos";
export const sectionGroups=[
 {title:"الواجهة والأعمال",sections:["hero","stream","work","device","reel","gallery"]},
 {title:"الخدمات والبيع",sections:["services","industries","packages","offer","process"]},
 {title:"الثقة والتواصل",sections:["trust","testimonials","faq","contact"]},
 {title:"تفاصيل التصميم",sections:["bridge1","bridge2"]}
] as const satisfies readonly {title:string;sections:readonly HomeSectionId[]}[];
export const sectionNames:Record<HomeSectionId,string>={hero:"أول جزء في الموقع",stream:"شريط التصميمات المتحرك",work:"أعمالنا المختارة",device:"الأعمال داخل الموبايل",reel:"فيديو الاستعراض",gallery:"معرض التصميمات",services:"الخدمات",industries:"مجالات العمل",packages:"الباقات والأسعار",offer:"العروض",process:"طريقة العمل",trust:"الثقة والعملاء",testimonials:"آراء العملاء",faq:"الأسئلة الشائعة",contact:"بيانات التواصل",bridge1:"الفاصل البصري الأول",bridge2:"الفاصل البصري الثاني"};
export const artworkSlots:Partial<Record<HomeSectionId,PortfolioSlot|"gallery">>={hero:"hero",stream:"stream",work:"selected",device:"device",reel:"reel",gallery:"gallery"};
export function sectionTabs(id:HomeSectionId):{id:WorkspaceTab;label:string}[]{
 const tabs:{id:WorkspaceTab;label:string}[]=[];
 if(id==="hero")tabs.push({id:"content",label:"العنوان والنص"});
 else if(!artworkSlots[id])tabs.push({id:"content",label:id==="trust"?"أرقام الثقة":id==="contact"?"بيانات التواصل":"المحتوى"});
 if(artworkSlots[id])tabs.push({id:"artwork",label:id==="hero"?"الصور والتصميمات":"الأعمال المعروضة"});
 if(id==="trust")tabs.push({id:"logos",label:"شعارات العملاء"});
 if(["packages","testimonials","faq","contact","services","trust","offer","stream","work","device","reel","gallery"].includes(id))tabs.push({id:"layout",label:"إعدادات القسم"});
 return tabs;
}
export function readWorkspaceSection(raw:unknown):HomeSectionId|null{return typeof raw==="string"&&Object.prototype.hasOwnProperty.call(homeSectionMeta,raw)?raw as HomeSectionId:null}
export function readWorkspaceTab(id:HomeSectionId,raw:unknown):WorkspaceTab{const tabs=sectionTabs(id);return tabs.find(t=>t.id===raw)?.id??tabs[0].id;}
export function websiteSectionHref(id:HomeSectionId,tab?:WorkspaceTab){return "/admin/website?section="+id+(tab?"&tab="+tab:"");}
