import {canEditContent,canEditCommercial,type SimpleAdminRole} from "./roles";
export type WebsiteReadiness={logo:boolean;whatsapp:boolean;projectsPublished:number;projectsDraft:number;heroProjects:number;heroEnabled:boolean;services:number;packagesPublished:number;packagesDraft:number;invalidPublishedPrices:boolean};
export type JourneyStep={id:string;title:string;description:string;done:boolean;href:string;action:string;allowed:boolean};
export function websiteJourney(data:WebsiteReadiness,role:SimpleAdminRole):JourneyStep[]{
 const edit=canEditContent(role),commercial=canEditCommercial(role);
 return [
 {id:"brand",title:"عرّف الناس بالبراند",description:"ارفع شعار الموقع الرسمي بدل رمز CM المؤقت.",done:data.logo,href:"/admin/brand",action:"رفع اللوجو",allowed:commercial},
 {id:"contact",title:"جهّز التواصل",description:"أضف رقم واتساب والبريد وروابط صفحاتك.",done:data.whatsapp,href:"/admin/content?section=settings#contact-settings",action:"إدخال بيانات التواصل",allowed:commercial},
 {id:"projects",title:"أضف أول مشروع حقيقي",description:data.projectsDraft>0?data.projectsDraft+" مسودة تحتاج مراجعة ونشر.":"ارفع التصميمات والفيديوهات وانشر مشروعًا ليحل محل النماذج التوضيحية.",done:data.projectsPublished>0,href:data.projectsDraft>0?"/admin/projects?status=draft":"/admin/projects/new",action:data.projectsDraft>0?"استكمال المسودات":"إضافة أول مشروع",allowed:edit},
 {id:"hero",title:"اختر الأعمال في واجهة الموقع",description:!data.heroEnabled?"عرض الأعمال في الواجهة معطّل حاليًا.":"اختر المشروع الذي سيظهر أولًا في الـ Hero، أو استخدم الاختيار التلقائي.",done:data.heroEnabled&&data.heroProjects>0,href:"/admin/portfolio#portfolio-hero",action:"ترتيب أعمال الواجهة",allowed:commercial&&data.projectsPublished>0},
 {id:"services",title:"راجع الخدمات",description:data.services+" خدمة نشطة؛ وجود الخدمات لا يعني أن النصوص والصور تمت مراجعتها.",done:data.services>0,href:"/admin/content?section=services",action:"مراجعة الخدمات",allowed:edit},
 {id:"packages",title:"جهّز الباقات والأسعار",description:data.packagesDraft+" باقة مسودة. أدخل أسعارك الحقيقية والمميزات ثم انشر.",done:data.packagesPublished>0&&!data.invalidPublishedPrices,href:"/admin/content?section=packages",action:"إدارة الباقات",allowed:commercial}
 ];
}
export function nextWebsiteStep(steps:JourneyStep[]){return steps.find(s=>!s.done&&s.allowed)??null;}
