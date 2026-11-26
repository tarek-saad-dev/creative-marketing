export const mockupStyles = ["auto","book","social","brand","screen","plain"] as const;
export type MockupChoice = typeof mockupStyles[number];
export type MockupStyle = Exclude<MockupChoice,"auto">;
export const mockupLabels:Record<MockupChoice,string> = {auto:"تلقائي",book:"كتاب ثلاثي الأبعاد",social:"Social Post",brand:"Brand Identity Board",screen:"Motion / Screen",plain:"تصميم بدون فريم"};
type MockupProject = {primaryMediaType?:string|null;services?:{slug?:string;nameAr?:string;nameEn?:string}[]};
export function resolveMockupStyle(project?:MockupProject,choice:MockupChoice="auto",mediaType?:string,conceptTheme?:string):MockupStyle{
  if(choice!=="auto")return choice;
  if(mediaType==="VIDEO"||(!mediaType&&project?.primaryMediaType==="VIDEO"))return "screen";
  if(conceptTheme==="book")return "book";
  if(conceptTheme==="brand")return "brand";
  if(conceptTheme==="digital")return "screen";
  if(conceptTheme==="cut")return "social";
  const names=(project?.services??[]).map(s=>[s.slug,s.nameAr,s.nameEn].filter(Boolean).join(" ")).join(" ").toLowerCase();
  if(/\b(book|books|editorial|textbook|workbook)\b|كتاب|كتب|مذكر|ملزم/.test(names))return "book";
  if(/\b(branding|brand identity|visual identity|logo)\b|هوي[ةه]|شعار/.test(names))return "brand";
  if(/\b(social|posts|content creation)\b|سوشيال|بوست|محتوى/.test(names))return "social";
  if(/\b(video|motion|website|web design|reels)\b|فيديو|موشن|موقع/.test(names))return "screen";
  return "plain";
}
