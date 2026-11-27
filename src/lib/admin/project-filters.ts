export const projectFilters=["all","published","draft","archived","deleted"] as const;
export type ProjectFilter=typeof projectFilters[number];
export const PROJECT_PAGE_SIZE=18;
export function parseProjectFilters(raw:Record<string,string|string[]|undefined>){
 const get=(key:string)=>{const value=raw[key];return typeof value==="string"?value:Array.isArray(value)?value[0]??"":"";};
 const status=get("status");const sort=get("sort");const p=Number(get("page"));
 return {status:projectFilters.includes(status as ProjectFilter)?status as ProjectFilter:"all" as const,q:get("q").trim().slice(0,120),industry:get("industry").trim().slice(0,120),sort:sort==="oldest"||sort==="name"?sort:"recent" as const,page:Number.isSafeInteger(p)&&p>0?Math.min(p,100000):1};
}
export type ProjectFilters=ReturnType<typeof parseProjectFilters>;
export function projectListHref(filters:ProjectFilters,patch:Partial<ProjectFilters>={}){
 const value={...filters,...patch};const qs=new URLSearchParams();
 if(value.status!=="all")qs.set("status",value.status);
 if(value.q)qs.set("q",value.q);
 if(value.industry)qs.set("industry",value.industry);
 if(value.sort!=="recent")qs.set("sort",value.sort);
 if(value.page>1)qs.set("page",String(value.page));
 return "/admin/projects"+(qs.size?"?"+qs.toString():"");
}
