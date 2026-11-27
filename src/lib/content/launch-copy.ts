import type {HomeLayout} from "./homepage-editor";

/** Suggested launch copy only. Existing explicit copy, media and layout stay intact. */
export const launchCopy:HomeLayout["copy"]={
 heroTitle:"إبداع يلفت النظر.\nوبراند يكبر.",
 heroDescription:"استراتيجية، تصميم ومحتوى يخلي مشروعك يظهر بشكل احترافي ويقدم قيمة واضحة لعملائك.",
 heroPrimaryCta:"شوف شغلنا",
 heroSecondaryCta:"استكشف الباكدجات",
 packagesTitle:"اختار الباقة المناسبة لمشروعك",
 processTitle:"من الفكرة للتنفيذ",
 processDescription:"نفهم نشاطك، نحدد الاتجاه الإبداعي، وننفذ المحتوى بخطوات واضحة ومراجعة مستمرة.",
 testimonialsTitle:"آراء عملائنا",
 faqTitle:"أسئلة ممكن تكون في بالك",
 contactTitle:"خلينا نبدأ مشروعك",
 contactDescription:"احكيلنا عن نشاطك والهدف اللي عاوز توصله، ونحدد معاك الخطوة المناسبة."
};
export function fillLaunchCopy(layout:HomeLayout):HomeLayout{
 const copy={...layout.copy};
 for(const key of Object.keys(launchCopy) as Array<keyof HomeLayout["copy"]>){
  if(!copy[key].trim())copy[key]=launchCopy[key];
 }
 return {...layout,copy};
}
