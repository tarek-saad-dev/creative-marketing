import {z} from "zod";
import {processStepsSchema,bridgeWordsSchema,defaultProcessSteps,defaultBridgeWords,extraHomeChanges} from "./homepage-extra-content";
import {industryContentSchema,defaultIndustryContent,industryChangedFields} from "./industry-content";
export const HOMEPAGE_EDITOR_KEY="landing.page.editor";
export const homeSections=[
 {id:"hero",label:"الواجهة الرئيسية",required:true,locked:true,editor:"/admin/content?section=settings"},
 {id:"stream",label:"شريط الأعمال المتحرك",editor:"/admin/portfolio"},
 {id:"trust",label:"الثقة وشعارات العملاء",editor:"/admin/content?section=trust"},
 {id:"work",label:"المشاريع المختارة",editor:"/admin/portfolio"},
 {id:"bridge1",label:"الفاصل البصري الأول"},
 {id:"services",label:"الخدمات",required:true,editor:"/admin/content?section=services"},
 {id:"industries",label:"التخصصات",required:true},
 {id:"device",label:"عرض الموبايل",editor:"/admin/portfolio"},
 {id:"reel",label:"فيديو الاستعراض",editor:"/admin/portfolio"},
 {id:"gallery",label:"معرض التصميمات",editor:"/admin/portfolio"},
 {id:"bridge2",label:"الفاصل البصري الثاني"},
 {id:"offer",label:"العرض المحدود",editor:"/admin/content?section=offers"},
 {id:"packages",label:"الباقات",required:true,editor:"/admin/content?section=packages"},
 {id:"process",label:"طريقة العمل",required:true},
 {id:"testimonials",label:"آراء العملاء",editor:"/admin/content?section=testimonials"},
 {id:"faq",label:"الأسئلة الشائعة",editor:"/admin/content?section=faqs"},
 {id:"contact",label:"التواصل",required:true,locked:true,editor:"/admin/content?section=settings"}
] as const satisfies readonly {id:string;label:string;required?:boolean;locked?:boolean;editor?:string}[];
export type HomeSectionId=typeof homeSections[number]["id"];
const ids=homeSections.map(s=>s.id);
export const homeSectionMeta:Record<HomeSectionId,{id:HomeSectionId;label:string;required?:boolean;locked?:boolean;editor?:string}>=Object.fromEntries(homeSections.map(s=>[s.id,s])) as Record<HomeSectionId,{id:HomeSectionId;label:string;required?:boolean;locked?:boolean;editor?:string}>;
const text=z.string().trim().max(1000);
const copy=z.object({heroTitle:text,heroDescription:text,heroPrimaryCta:z.string().trim().max(80),heroSecondaryCta:z.string().trim().max(80),packagesTitle:text,processTitle:text,processDescription:text,testimonialsTitle:text,faqTitle:text,contactTitle:text,contactDescription:text});
const section=z.object({id:z.enum(["hero","stream","trust","work","bridge1","services","industries","device","reel","gallery","bridge2","offer","packages","process","testimonials","faq","contact"]),enabled:z.boolean()});
export const homeLayoutSchema=z.object({sections:z.array(section).length(ids.length),copy,industries:industryContentSchema.default(defaultIndustryContent),processSteps:processStepsSchema.default(defaultProcessSteps),bridgeWords:bridgeWordsSchema.default(defaultBridgeWords)}).superRefine((v,ctx)=>{
 if(new Set(v.sections.map(s=>s.id)).size!==ids.length||v.sections[0]?.id!=="hero"||v.sections.at(-1)?.id!=="contact"||v.sections.some(s=>homeSectionMeta[s.id].required&&!s.enabled))ctx.addIssue({code:"custom",message:"ترتيب الأقسام أو الأقسام الأساسية غير صالح"});
});
export type HomeLayout=z.infer<typeof homeLayoutSchema>;
export function defaultHomeLayout():HomeLayout{return {processSteps:defaultProcessSteps(),bridgeWords:defaultBridgeWords(),industries:defaultIndustryContent(),sections:ids.map(id=>({id,enabled:true})),copy:{heroTitle:"",heroDescription:"",heroPrimaryCta:"",heroSecondaryCta:"",packagesTitle:"",processTitle:"",processDescription:"",testimonialsTitle:"",faqTitle:"",contactTitle:"",contactDescription:""}};}
export const HOME_HISTORY_LIMIT=12;
const revision=z.number().int().nonnegative();
const archivedVersionSchema=z.object({id:revision,publicationRevision:revision.nullable(),publishedAt:z.string().datetime().nullable(),archivedAt:z.string().datetime(),layout:homeLayoutSchema});
export type HomeArchivedVersion=z.infer<typeof archivedVersionSchema>;
const baseEditorSchema=z.object({revision,published:homeLayoutSchema,draft:homeLayoutSchema.nullable()});
export const homeEditorSchema=baseEditorSchema.extend({history:z.array(archivedVersionSchema).max(HOME_HISTORY_LIMIT).default([]),publishedRevision:revision.nullable().default(null),publishedAt:z.string().datetime().nullable().default(null)});
export type HomeEditorState=z.infer<typeof homeEditorSchema>;
export function readHomeEditor(raw:unknown):HomeEditorState{
 const base=baseEditorSchema.safeParse(raw);
 if(!base.success)return {revision:0,published:defaultHomeLayout(),draft:null,history:[],publishedRevision:null,publishedAt:null};
 // A missing or corrupt history must not replace a valid live layout.
 const source=raw as Record<string,unknown>;
 const history=Array.isArray(source.history)?source.history.flatMap(value=>{const parsed=archivedVersionSchema.safeParse(value);return parsed.success&&parsed.data.id<=base.data.revision?[parsed.data]:[];}):[];
 const seen=new Set<number>();
 const unique=history.sort((a,b)=>b.id-a.id).filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true;}).slice(0,HOME_HISTORY_LIMIT);
 const publishedRevision=revision.nullable().safeParse(source.publishedRevision);
 const publishedAt=z.string().datetime().nullable().safeParse(source.publishedAt);
 return {...base.data,history:unique,publishedRevision:publishedRevision.success?publishedRevision.data:null,publishedAt:publishedAt.success?publishedAt.data:null};
}
export const homeEditorMutationSchema=z.discriminatedUnion("action",[z.object({action:z.literal("save"),revision,layout:homeLayoutSchema}),z.object({action:z.literal("publish"),revision}),z.object({action:z.literal("discard"),revision}),z.object({action:z.literal("restore"),revision,versionId:revision})]);
export function applyHomeEditorMutation(state:HomeEditorState,raw:unknown,now=new Date()):HomeEditorState{
 const input=homeEditorMutationSchema.parse(raw);
 if(input.revision!==state.revision)throw new Error("تم تعديل الصفحة من جلسة أخرى. أعد تحميل المحرر قبل الحفظ.");
 const nextRevision=state.revision+1;
 if(input.action==="save")return {...state,revision:nextRevision,draft:input.layout};
 if(input.action==="restore"){const version=state.history.find(item=>item.id===input.versionId);if(!version)throw new Error("الإصدار غير موجود");return {...state,revision:nextRevision,draft:structuredClone(version.layout)};}
 if(input.action==="publish"){
  if(!state.draft)throw new Error("لا توجد مسودة للنشر");
  const timestamp=now.toISOString();
  const previous={id:nextRevision,publicationRevision:state.publishedRevision,publishedAt:state.publishedAt,archivedAt:timestamp,layout:state.published};
  return {...state,revision:nextRevision,published:state.draft,draft:null,publishedRevision:nextRevision,publishedAt:timestamp,history:[previous,...state.history].slice(0,HOME_HISTORY_LIMIT)};
 }
 return {...state,revision:nextRevision,draft:null};
}
export function describeHomeChanges(published:HomeLayout,draft:HomeLayout){
 const sections=draft.sections.flatMap((section,index)=>{const previous=published.sections.find(s=>s.id===section.id)!;const oldIndex=published.sections.findIndex(s=>s.id===section.id);return oldIndex!==index||previous.enabled!==section.enabled?[{id:section.id,from:oldIndex+1,to:index+1,wasEnabled:previous.enabled,enabled:section.enabled}]:[];});
 const copy=(Object.keys(draft.copy) as Array<keyof HomeLayout["copy"]>).filter(key=>draft.copy[key]!==published.copy[key]).map(key=>({key,before:published.copy[key],after:draft.copy[key]}));
 return {sections,copy:[...copy,...industryChangedFields(published.industries,draft.industries),...extraHomeChanges(published,draft)]};
}
