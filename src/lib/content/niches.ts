export type Niche = {
  slug: string; path: string; label: string; eyebrow: string; headline: string;
  highlight: string; description: string; industry: string; source: string;
  requestHint: string; visual: "salon" | "teacher" | "books";
  services: { title: string; detail: string }[];
  steps: { title: string; detail: string }[];
  match: string[];
};

export const niches: Niche[] = [
  {
    slug: "salons", path: "/industries/salons", label: "الصالونات والباربر شوب",
    eyebrow: "BARBER & SALON MARKETING", headline: "شغلك يستاهل", highlight: "إن الناس تشوفه.",
    description: "من أول صورة للحلاقة لحد الحملات اللي تشجع على الحجز، نبني حضور بصري يعبر عن مستوى الصالون ويخلّي خدماتك واضحة للعميل.",
    industry: "صالونات وباربر شوب", source: "niche_salons", requestHint: "أرغب في خطة تسويق للصالون أو الباربر شوب.",
    visual: "salon", match: ["barber","salon","صالون","حلاق","باربر"],
    services: [
      {title:"محتوى يبرز جودة شغلك",detail:"تصميمات للخدمات، عروض موسمية، قبل وبعد من صورك المعتمدة، وأفكار ريلز."},
      {title:"هوية تليق بالصالون",detail:"اتجاه بصري ثابت للصفحة، وقوالب متناسقة للمحتوى والعروض."},
      {title:"حملات للحجز والزيارات",detail:"رسائل إعلانية تستهدف الجمهور المناسب حسب المنطقة والخدمة، مع متابعة الأداء حسب نطاق الاتفاق."},
      {title:"خطة محتوى قابلة للتنفيذ",detail:"تنظيم أفكار النشر، تقديم الخدمات والأسعار المعتمدة، ودعوات واضحة للحجز."}
    ],
    steps:[{title:"نفهم الصالون",detail:"المكان والخدمات والجمهور وطريقة الحجز."},{title:"نبني الاتجاه",detail:"نحدد شكل المحتوى والرسائل والأولويات."},{title:"ننظم التنفيذ",detail:"نتفق على المخرجات والجدول والمتابعة."}]
  },
  {
    slug: "teachers", path: "/industries/teachers", label: "المدرسين والمراكز التعليمية",
    eyebrow:"EDUCATION MARKETING", headline:"محتواك التعليمي.", highlight:"بهوية الناس تفتكرها.",
    description:"ساعد الطلاب وأولياء الأمور يتعرفوا على أسلوبك، مواعيدك وموادك التعليمية من خلال محتوى منظم وهوية واضحة تناسب المادة والجمهور.",
    industry:"مدرسون ومراكز تعليمية", source:"niche_teachers", requestHint:"أرغب في تطوير الهوية والمحتوى التسويقي لخدماتي التعليمية.",
    visual:"teacher",match:["teacher","education","tutor","مدرس","تعليم","سنتر","مركز تعليمي"],
    services:[
      {title:"هوية المدرس",detail:"أسلوب بصري متناسق للصفحة، إعلانات الحصص والمراجعات."},
      {title:"محتوى تعليمي وتسويقي",detail:"تصميمات للمواعيد والشرح والعروض التعليمية، وأفكار فيديوهات قصيرة."},
      {title:"حملات التسجيل",detail:"صياغة رسائل للحصص والمجموعات مع خطوات تسجيل واضحة، حسب نطاق الاتفاق."},
      {title:"Teachers Books",detail:"تصميم أغلفة ومذكرات وكتب تعليمية، وتنظيم الصفحات بصريًا."}
    ],
    steps:[{title:"نفهم المادة والجمهور",detail:"الصفوف الدراسية، المواعيد، والمحتوى المتاح."},{title:"نحدد الشكل",detail:"هوية وأسلوب نشر يناسبان المادة."},{title:"نجهز المحتوى",detail:"مخرجات واضحة وجدول متفق عليه."}]
  },
  {
    slug:"teachers-books",path:"/services/teachers-books",label:"Teachers Books",
    eyebrow:"TEACHERS BOOKS / EDITORIAL DESIGN",headline:"كتابك مش مجرد صفحات.",highlight:"ده جزء من هويتك.",
    description:"نحوّل المحتوى التعليمي اللي بتقدمه إلى تجربة قراءة منظمة ومميزة، من الغلاف وتنسيق الصفحات إلى تجهيز ملفات التسليم المتفق عليها.",
    industry:"مدرسون وكتب تعليمية",source:"niche_teachers_books",requestHint:"أرغب في تصميم كتاب أو مذكرة تعليمية. المادة: ",
    visual:"books",match:["book","مذكرة","كتب","كتاب","ملزمة"],
    services:[
      {title:"Cover Design",detail:"غلاف يعبر عن المادة وهوية المدرس، بتكوين واضح وجذاب."},
      {title:"Editorial Layout",detail:"تنظيم النصوص والعناوين والهوامش والجداول حسب طبيعة المحتوى."},
      {title:"Visual System",detail:"قوالب موحدة للدروس والأسئلة والمراجعات، مع مراعاة سهولة القراءة."},
      {title:"Print-ready Delivery",detail:"تجهيز ملف الطباعة وفق المقاس ومواصفات المطبعة المتفق عليها، ونسخة رقمية حسب الطلب."}
    ],
    steps:[{title:"استلام المحتوى",detail:"المادة، المقاس، عدد الصفحات، ومواصفات التسليم."},{title:"اعتماد نموذج",detail:"غلاف واتجاه داخلي قبل تطبيقه على باقي الصفحات."},{title:"التنسيق والتسليم",detail:"تنفيذ المحتوى المعتمد، المراجعة، وتجهيز الملفات."}]
  }
];

export function nicheForSource(source: string) {
  return niches.find(niche => source === niche.source || source.startsWith(niche.source + ":"));
}
export function matchesNiche(niche: Niche, project: { industry: string | null; services: { nameAr: string; nameEn: string }[] }) {
  // Match published industry; book service names can be explicit evidence for editorial design.
  const value = (niche.visual === "books" ? [project.industry, ...project.services.flatMap(service => [service.nameAr, service.nameEn])] : [project.industry]).filter(Boolean).join(" ").toLowerCase();
  return niche.match.some(term => value.includes(term.toLowerCase()));
}
