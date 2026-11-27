import type {HomeSectionId} from "../content/homepage-editor";
type Action={label:string;href:string};
const editor=(id:HomeSectionId):Action=>({label:"تعديل النصوص وإعدادات القسم",href:"/admin/pages?section="+id});
const content=(section:string,label:string):Action=>({label,href:"/admin/content?section="+section});
const portfolio=(slot:string,label:string):Action=>({label,href:"/admin/portfolio#portfolio-"+slot});
export function visualSectionActions(id:HomeSectionId):Action[]{
 switch(id){
 case "hero":return [editor(id),portfolio("hero","اختيار التصميمات"),{label:"إضافة مشروع",href:"/admin/projects/new"}];
 case "stream":return [portfolio("stream","اختيار الأعمال"),editor(id)];
 case "trust":return [content("trust","أرقام الثقة"),content("logos","شعارات العملاء"),editor(id)];
 case "work":return [portfolio("selected","اختيار الأعمال"),{label:"إدارة المشاريع",href:"/admin/projects"},editor(id)];
 case "services":return [content("services","تعديل الخدمات والصور"),editor(id)];
 case "industries":return [{label:"تعديل المجالات والصور",href:editor(id).href}];
 case "device":return [portfolio("device","اختيار أعمال الموبايل"),editor(id)];
 case "reel":return [portfolio("reel","اختيار الفيديو"),editor(id)];
 case "gallery":return [{label:"إدارة المشاريع والوسائط",href:"/admin/projects"},portfolio("gallery","إعدادات المعرض"),editor(id)];
 case "offer":return [content("offers","إدارة العروض"),editor(id)];
 case "packages":return [content("packages","تعديل الباقات والأسعار"),editor(id)];
 case "testimonials":return [content("testimonials","تعديل الآراء"),editor(id)];
 case "faq":return [content("faqs","تعديل الأسئلة"),editor(id)];
 case "contact":return [content("settings","بيانات التواصل"),editor(id)];
 case "process":return [{label:"تعديل خطوات العمل",href:editor(id).href}];
 case "bridge1":case "bridge2":return [{label:"تعديل كلمات الفاصل",href:editor(id).href}];
 }
}
