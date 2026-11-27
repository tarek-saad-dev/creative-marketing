export const defaultSeoTitle="Creative Marketing | تسويق إبداعي وتصميم وإدارة سوشيال ميديا";
export const defaultSeoDescription="كرييتف ماركتنج: استراتيجية، تصميم، محتوى وهوية بصرية للبراندات والصالونات والمدرسين، وتصميم الكتب والمذكرات التعليمية.";
function text(raw:unknown){return typeof raw==="string"?raw.trim():"";}
export function canonicalOrigin(raw:unknown):string|null{
 try{const url=new URL(text(raw));if(url.username||url.password||url.pathname!=="/"||url.search||url.hash)return null;
 if(url.protocol==="https:"||(url.protocol==="http:"&&["localhost","127.0.0.1","[::1]"].includes(url.hostname)))return url.origin;
 return null;}catch{return null;}
}
export function readSeo(settings:Record<string,unknown>,env:{publicUrl?:string;productionHost?:string}={}){
 const origin=canonicalOrigin(settings["seo.siteUrl"])??canonicalOrigin(env.publicUrl)??canonicalOrigin(env.productionHost?"https://"+env.productionHost:"")??"http://localhost:3000";
 const title=text(settings["seo.siteTitle"])||defaultSeoTitle,description=text(settings["seo.metaDescriptionAr"])||defaultSeoDescription;
 let image:string|undefined;
 const raw=text(settings["seo.ogImageUrl"]);
 if(raw){try{const url=new URL(raw,origin);if((raw.startsWith("/")&&!raw.startsWith("//")&&url.origin===origin||raw.startsWith("https://"))&&url.protocol==="https:"&&!url.username&&!url.password)image=url.href;}catch{}}
 return {origin,title,description,image};
}
