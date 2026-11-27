import {redirect} from "next/navigation";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const sp=await searchParams;const qs=new URLSearchParams({section:"offers"});for(const key of ["edit","new"])if(typeof sp[key]==="string")qs.set(key,sp[key]);redirect("/admin/content?"+qs.toString());}
