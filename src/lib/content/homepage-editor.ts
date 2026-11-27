import {z} from "zod";
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
export const homeLayoutSchema=z.object({sections:z.array(section).length(ids.length),copy}).superRefine((v,ctx)=>{
 if(new Set(v.sections.map(s=>s.id)).size!==ids.length||v.sections[0]?.id!=="hero"||v.sections.at(-1)?.id!=="contact"||v.sections.some(s=>homeSectionMeta[s.id].required&&!s.enabled))ctx.addIssue({code:"custom",message:"ترتيب الأقسام أو الأقسام الأساسية غير صالح"});
});
export type HomeLayout=z.infer<typeof homeLayoutSchema>;
export function defaultHomeLayout():HomeLayout{return {sections:ids.map(id=>({id,enabled:true})),copy:{heroTitle:"",heroDescription:"",heroPrimaryCta:"",heroSecondaryCta:"",packagesTitle:"",processTitle:"",processDescription:"",testimonialsTitle:"",faqTitle:"",contactTitle:"",contactDescription:""}};}
export const homeEditorSchema=z.object({revision:z.number().int().nonnegative(),published:homeLayoutSchema,draft:homeLayoutSchema.nullable()});
export type HomeEditorState=z.infer<typeof homeEditorSchema>;
export function readHomeEditor(raw:unknown):HomeEditorState{const parsed=homeEditorSchema.safeParse(raw);return parsed.success?parsed.data:{revision:0,published:defaultHomeLayout(),draft:null};}
export const homeEditorMutationSchema=z.discriminatedUnion("action",[z.object({action:z.literal("save"),revision:z.number().int().nonnegative(),layout:homeLayoutSchema}),z.object({action:z.literal("publish"),revision:z.number().int().nonnegative()}),z.object({action:z.literal("discard"),revision:z.number().int().nonnegative()})]);
export function applyHomeEditorMutation(state:HomeEditorState,raw:unknown):HomeEditorState{
 const input=homeEditorMutationSchema.parse(raw);
 if(input.revision!==state.revision)throw new Error("تم تعديل الصفحة من جلسة أخرى. أعد تحميل المحرر قبل الحفظ.");
 if(input.action==="save")return {...state,revision:state.revision+1,draft:input.layout};
 if(input.action==="publish"){if(!state.draft)throw new Error("لا توجد مسودة للنشر");return {revision:state.revision+1,published:state.draft,draft:null};}
 return {...state,revision:state.revision+1,draft:null};
}
