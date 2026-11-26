"use client";
import {useState,useRef,useTransition} from "react";
import {useRouter} from "next/navigation";
import {createQuickProjectAction} from "@/server/actions/admin/project.action";
import {UnsavedChangesGuard} from "@/components/admin/unsaved-changes-guard";
export function QuickProjectForm({services}:{services:{id:string;nameAr:string}[]}){
  const router=useRouter();
  const [title,setTitle]=useState(""),[industry,setIndustry]=useState(""),[summary,setSummary]=useState(""),[clientName,setClientName]=useState(""),[serviceIds,setServices]=useState<string[]>([]);
  const [pending,startTransition]=useTransition(),[error,setError]=useState("");
  const [saved,setSaved]=useState(false);const lock=useRef(false);
  const ready=title.trim().length>=2&&summary.trim().length>=2&&industry.trim().length>0;
  function submit(){if(!ready||lock.current)return;lock.current=true;setError("");startTransition(async()=>{try{const result=await createQuickProjectAction({title,industry,summary,clientName,serviceIds});if(!result.ok){setError(result.error);return;}setSaved(true);router.push("/admin/projects/"+result.data.id+"#media");}catch{setError("تعذر الحفظ. راجع قائمة المشاريع قبل إعادة المحاولة.");}finally{lock.current=false;}});}
  return <form className="admin-card space-y-5 p-5" onSubmit={e=>{e.preventDefault();submit();}} aria-busy={pending}>
    <UnsavedChangesGuard dirty={!saved&&!pending&&Boolean(title||industry||summary||clientName||serviceIds.length)}/>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-semibold">اسم المشروع<input className="admin-input w-full" required minLength={2} maxLength={160} value={title} disabled={pending||saved} onChange={e=>setTitle(e.target.value)} placeholder="مثال: حملة شهر ديسمبر"/></label>
      <label className="space-y-2 text-sm font-semibold">المجال<input className="admin-input w-full" required maxLength={120} value={industry} disabled={pending||saved} onChange={e=>setIndustry(e.target.value)} placeholder="مثال: صالونات أو تعليم"/></label>
      <label className="space-y-2 text-sm font-semibold sm:col-span-2">وصف مختصر<textarea className="admin-input min-h-24 w-full" required minLength={2} maxLength={600} value={summary} disabled={pending||saved} onChange={e=>setSummary(e.target.value)} placeholder="ما الذي صممناه لهذا المشروع؟"/></label>
      <label className="space-y-2 text-sm">اسم العميل (اختياري)<input className="admin-input w-full" maxLength={160} value={clientName} disabled={pending||saved} onChange={e=>setClientName(e.target.value)}/></label>
    </div>
    <fieldset disabled={pending||saved} className="space-y-3"><legend className="text-sm font-semibold">الخدمات المرتبطة (اختياري)</legend><div className="flex flex-wrap gap-2">{services.map(s=><label key={s.id} className="flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm"><input type="checkbox" checked={serviceIds.includes(s.id)} onChange={e=>setServices(old=>e.target.checked?[...old,s.id]:old.filter(id=>id!==s.id))}/>{s.nameAr}</label>)}</div></fieldset>
    <p className="text-sm text-foreground-muted">الرابط يُنشأ تلقائيًا حتى لو كان الاسم عربيًا. سيتم حفظ المشروع كمسودة فقط، ثم تنتقل مباشرة إلى رفع الوسائط.</p>
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    <button type="submit" disabled={!ready||pending||saved} className="min-h-11 rounded-md bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">{pending?"جاري إنشاء المسودة…":"حفظ المسودة وإضافة التصميمات"}</button>
  </form>;
}
