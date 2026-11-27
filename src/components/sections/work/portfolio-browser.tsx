"use client";
import { useState } from "react";
import Link from "next/link";
import { WorkWall } from "./work-wall";
import type { WorkWallProject } from "@/server/services/project.service";
export function PortfolioBrowser({projects}:{projects:WorkWallProject[]}){
  const [query,setQuery]=useState("");
  const [industry,setIndustry]=useState("");
  const [limit,setLimit]=useState(12);
  const industries=[...new Set(projects.map(p=>p.industry).filter((value):value is string=>Boolean(value)))];
  const filtered=projects.filter(p=>(!industry||p.industry===industry)&&[p.title,p.industry,p.summary,...p.services.map(s=>s.nameAr)].filter(Boolean).join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  if(!projects.length)return <div className="rounded-2xl border border-white/20 p-8 text-white">سيتم عرض المشاريع المنشورة هنا. <Link href="/#services" className="text-brand-aqua underline">استكشف خدماتنا</Link></div>;
  return <><div className="my-6 flex flex-wrap gap-3"><label className="min-w-0 flex-1 text-sm text-white">ابحث عن مشروع<input className="mt-2 block min-h-11 w-full rounded-xl border border-white/30 bg-[#252c69] px-4 text-white" value={query} onChange={e=>{setQuery(e.target.value);setLimit(12);}} placeholder="اسم المشروع أو الخدمة"/></label><label className="text-sm text-white">المجال<select className="mt-2 block min-h-11 max-w-full rounded-xl border border-white/30 bg-[#252c69] px-3 text-white" value={industry} onChange={e=>{setIndustry(e.target.value);setLimit(12);}}><option value="">كل المجالات</option>{industries.map(value=><option key={value}>{value}</option>)}</select></label></div><p aria-live="polite" className="mb-4 text-sm text-white">{filtered.length} مشروع</p>{filtered.length?<WorkWall projects={filtered.slice(0,limit)}/>:<p className="rounded-xl border border-white/20 p-6 text-white">لا توجد نتائج مطابقة.</p>}{filtered.length>limit&&<button type="button" className="mx-auto mt-6 block min-h-11 rounded-full border border-white/30 px-6 text-brand-aqua" onClick={()=>setLimit(v=>v+12)}>عرض المزيد</button>}</>;
}
