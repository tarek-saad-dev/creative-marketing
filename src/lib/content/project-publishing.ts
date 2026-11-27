import { isImageCandidate } from "../media/public-media";
export function projectDraftSlug(title:string,suffix:string){
  const stem=title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/[\s-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100).replace(/-+$/,"")||"project";
  return stem+"-"+suffix.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,32);
}
type Readiness={title?:string|null;slug?:string|null;industry?:string|null;summary?:string|null;coverImageUrl?:string|null;coverImageAlt?:string|null};
export function projectPublishChecklist(project:Readiness){
  return [
    {label:"العنوان",ok:Boolean(project.title?.trim())},
    {label:"الرابط",ok:Boolean(project.slug?.trim())},
    {label:"المجال",ok:Boolean(project.industry?.trim())},
    {label:"الملخص",ok:Boolean(project.summary?.trim())},
    {label:"صورة الغلاف",ok:isImageCandidate(project.coverImageUrl)},
    {label:"النص البديل للغلاف",ok:Boolean(project.coverImageAlt?.trim())},
  ];
}
