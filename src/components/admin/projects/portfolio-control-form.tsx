"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockupLabels, mockupStyles, resolveMockupStyle, type MockupChoice } from "@/lib/content/mockup-style";
import { ResilientImage } from "@/components/ui/resilient-media";
import { defaultPortfolioSettings, portfolioSections, selectPortfolioProjects, type PortfolioSettings, type PortfolioSlot } from "@/lib/content/portfolio-settings";
import { savePortfolioSettingsAction } from "@/server/actions/admin/portfolio.action";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import type { WorkWallProject } from "@/server/services/project.service";

export function PortfolioControlForm({initial,projects}:{initial:PortfolioSettings;projects:WorkWallProject[]}){
  const [value,setValue]=useState(initial);
  const [saved,setSaved]=useState(initial);
  const [pending,startTransition]=useTransition();
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  const router=useRouter();
  const dirty=JSON.stringify(value)!==JSON.stringify(saved);
  const byId=new Map(projects.map(project=>[project.id,project]));
  function update(key:PortfolioSlot,patch:Partial<PortfolioSettings[PortfolioSlot]>){
    setValue(old=>({...old,[key]:{...old[key],...patch}}));setNotice("");setError("");
  }
  function move(key:PortfolioSlot,index:number,delta:number){
    const ids=[...value[key].ids];const target=index+delta;
    if(target<0||target>=ids.length)return;
    [ids[index],ids[target]]=[ids[target],ids[index]];update(key,{ids});
  }
  function changeMockup(id:string,choice:MockupChoice){
    setValue(old=>{const mockups={...old.mockups};if(choice==="auto")delete mockups[id];else mockups[id]=choice;return {...old,mockups};});setNotice("");setError("");
  }
  function save(){
    setNotice("");setError("");
    startTransition(async()=>{const result=await savePortfolioSettingsAction(value);if(!result.ok){setError(result.error);return;}setSaved(value);setNotice("تم حفظ إعدادات الاستعراض.");router.refresh();});
  }
  return <div className="space-y-5">
    <UnsavedChangesGuard dirty={dirty&&!pending}/>
    <div className="admin-card space-y-2 p-4"><p className="font-semibold">اختيارات العرض</p><p className="text-sm text-foreground-muted">القائمة الفارغة تعني اختيارًا تلقائيًا حسب التمييز والترتيب. الاختيار اليدوي يعرض المشاريع المحددة فقط. المعاينة المصغرة التالية تتحدث قبل الحفظ؛ الموقع العام لا يتغير إلا عند الحفظ.</p><Link className="text-sm text-primary underline" href="/admin/projects">إدارة المشاريع والوسائط</Link></div>
    {portfolioSections.map(slot=>{
      const config=value[slot.key];
      const candidates=slot.key==="reel"?projects.filter(p=>p.primaryMediaType==="VIDEO"&&p.primaryMediaUrl):projects;
      const preview=selectPortfolioProjects(projects,value,slot.key);
      return <section key={slot.key} className="admin-card space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold" dir="ltr">{slot.label}</h2><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={config.enabled} disabled={pending} onChange={e=>update(slot.key,{enabled:e.target.checked})}/>إظهار القسم</label></div>
        <p className="text-xs text-foreground-muted">الحد الأقصى {slot.limit} · الحد الأدنى للعرض {slot.minimum} {slot.key==="hero"?"(أو عنوان بدون معرض عند عدم توفر أعمال)":""}</p>
        {config.enabled&&<><div className="flex flex-wrap gap-2"><select className="admin-input max-w-full" aria-label={"إضافة مشروع إلى "+slot.label} value="" disabled={pending||config.ids.length>=slot.limit} onChange={e=>{if(e.target.value)update(slot.key,{ids:[...config.ids,e.target.value]});}}><option value="">أضف مشروعًا للاختيار اليدوي</option>{candidates.filter(p=>!config.ids.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><button type="button" disabled={pending||!config.ids.length} onClick={()=>update(slot.key,{ids:[]})} className="min-h-10 rounded border border-border px-3 text-sm disabled:opacity-50">اختيار تلقائي</button></div>
          {config.ids.length>0&&<ol className="space-y-2">{config.ids.map((id,index)=><li key={id} className="flex flex-wrap items-center gap-2 rounded border border-border p-2"><span className="flex-1 text-sm">{index+1}. {byId.get(id)?.title||"مشروع غير منشور — أزله"}</span><button type="button" className="min-h-9 px-2" disabled={pending||index===0} onClick={()=>move(slot.key,index,-1)}>↑</button><button type="button" className="min-h-9 px-2" disabled={pending||index===config.ids.length-1} onClick={()=>move(slot.key,index,1)}>↓</button><button type="button" className="min-h-9 px-2 text-destructive" disabled={pending} onClick={()=>update(slot.key,{ids:config.ids.filter(x=>x!==id)})}>إزالة</button></li>)}</ol>}
          <div className="rounded-xl bg-[#2c1f73] p-3 text-white"><p className="mb-2 text-xs">معاينة ترتيب المحتوى · {preview.length} مشروع</p>{preview.length>=slot.minimum?<div className="flex gap-2 overflow-x-auto" dir="ltr">{preview.map(p=><div key={p.id} className="w-28 shrink-0"><div className="relative aspect-square rounded bg-[#1a245a]"><ResilientImage src={p.coverImageUrl} alt={p.coverImageAlt} sizes="112px"/></div><p className="mt-1 truncate text-xs" dir="auto">{p.title}</p></div>)}</div>:<p className="text-sm">لا يوجد عدد كافٍ من الأعمال المنشورة لهذا العرض.</p>}</div>
        </>}
      </section>;
    })}
    <section className="admin-card space-y-4 p-4"><h2 className="font-semibold">Adaptive 3D Mockups</h2><p className="text-sm text-foreground-muted">اختيار شكل الفريم لكل مشروع يظهر في الـ Hero. تلقائي يعتمد على الخدمات المرتبطة بالمشروع. التصميم نفسه لا يتغير ولا يتم قصه.</p>
      {selectPortfolioProjects(projects,value,"hero").map(project=><div key={project.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-[#2c1f73]"><ResilientImage src={project.coverImageUrl} alt={project.coverImageAlt} sizes="64px"/></div>
        <div className="min-w-0 flex-1"><p className="font-semibold break-words">{project.title}</p><p className="text-xs text-foreground-muted">الاستعراض الحالي: {mockupLabels[resolveMockupStyle(project,value.mockups[project.id])]}</p></div>
        <select className="admin-input max-w-full" aria-label={"شكل عرض "+project.title} value={value.mockups[project.id]??"auto"} disabled={pending} onChange={event=>changeMockup(project.id,event.target.value as MockupChoice)}>{mockupStyles.map(style=><option key={style} value={style}>{mockupLabels[style]}</option>)}</select>
      </div>)}
      {!selectPortfolioProjects(projects,value,"hero").length&&<p className="text-sm text-foreground-muted">انشر مشروعًا واختره في الـ Hero لتحديد شكل عرضه.</p>}
    </section>
    <section className="admin-card space-y-3 p-4"><h2 className="font-semibold">Creative Gallery</h2><label className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={value.gallery} disabled={pending} onChange={e=>setValue(old=>({...old,gallery:e.target.checked}))}/>إظهار معرض الصور والفيديو</label><label className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={value.comparisons} disabled={pending} onChange={e=>setValue(old=>({...old,comparisons:e.target.checked}))}/>إظهار Before & After داخل المعرض (يتطلب إظهار المعرض)</label></section>
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="text-sm text-emerald-700">{notice}</p>}
    <div className="flex flex-wrap gap-3"><button type="button" disabled={pending||!dirty} onClick={save} className="min-h-11 rounded-md bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">{pending?"جاري الحفظ…":"حفظ إعدادات الاستعراض"}</button><button type="button" disabled={pending} onClick={()=>setValue(defaultPortfolioSettings())} className="min-h-11 rounded-md border border-border px-4 text-sm">استعادة الإعدادات الافتراضية</button><Link href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm">فتح الموقع بعد الحفظ</Link></div>
  </div>;
}
