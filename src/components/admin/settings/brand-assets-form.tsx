"use client";
import {MediaPicker} from "@/components/admin/media/media-picker";
import {useState,useTransition,useRef} from "react";
import {useRouter} from "next/navigation";
import {BrandLogo} from "@/components/brand/logo";
import {brandAssetsSchema,defaultBrandAssets,type BrandAssets} from "@/lib/content/brand-assets";
import {getCloudinaryUploadSignatureAction} from "@/server/actions/admin/cloudinary.action";
import {saveBrandAssetsAction} from "@/server/actions/admin/brand-assets.action";
import {UnsavedChangesGuard} from "@/components/admin/unsaved-changes-guard";
export function BrandAssetsForm({initial,brandName,cloudinaryConfigured}:{initial:BrandAssets;brandName:string;cloudinaryConfigured:boolean}){
  const [value,setValue]=useState(initial),[saved,setSaved]=useState(initial);
  const [pending,startTransition]=useTransition();
  const [uploading,setUploading]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const lock=useRef(false);const router=useRouter();
  const parsed=brandAssetsSchema.safeParse(value);const dirty=JSON.stringify(value)!==JSON.stringify(saved);
  function update(patch:Partial<BrandAssets>){setValue(old=>({...old,...patch}));setNotice("");setError("");}
  async function upload(file:File,field:"headerLogo"|"footerLogo"){
    if(lock.current||pending)return;
    if(!["image/png","image/jpeg","image/webp","image/svg+xml"].includes(file.type)||file.size>5*1024*1024){setError("اختر PNG أو WebP أو JPG أو SVG بحجم لا يزيد عن 5 MB");return;}
    lock.current=true;setUploading(true);setError("");setNotice("");
    try{
      const sig=await getCloudinaryUploadSignatureAction({folderKey:"brand"});
      if(!sig.ok)throw new Error(sig.error);
      const body=new FormData();body.append("file",file);body.append("api_key",sig.data.apiKey);body.append("timestamp",String(sig.data.timestamp));body.append("signature",sig.data.signature);body.append("folder",sig.data.folder);
      const response=await fetch("https://api.cloudinary.com/v1_1/"+sig.data.cloudName+"/image/upload",{method:"POST",body});
      if(!response.ok)throw new Error("تعذر رفع الصورة");
      const result=await response.json() as {secure_url?:string};
      if(!result.secure_url)throw new Error("لم يرجع رابط الصورة");
      update({[field]:result.secure_url});
    }catch(err){setError(err instanceof Error?err.message:"فشل الرفع");}finally{lock.current=false;setUploading(false);}
  }
  function save(){if(!parsed.success||lock.current)return;setError("");setNotice("");startTransition(async()=>{const result=await saveBrandAssetsAction(parsed.data);if(!result.ok){setError(result.error);return;}setSaved(parsed.data);setValue(parsed.data);setNotice("تم حفظ الهوية ونشر اللوجو في الموقع.");router.refresh();});}
  return <div className="space-y-5"><UnsavedChangesGuard dirty={dirty&&!pending}/>
    <div className="admin-card space-y-4 p-4">
      {(["headerLogo","footerLogo"] as const).map(field=><div key={field} className="space-y-2"><label className="block text-sm font-semibold" htmlFor={field}>{field==="headerLogo"?"لوجو الـ Navbar":"لوجو الـ Footer (اختياري)"}</label><input id={field} dir="ltr" className="admin-input w-full" value={value[field]} disabled={pending||uploading} onChange={e=>update({[field]:e.target.value})} placeholder="https://..."/><MediaPicker imagesOnly disabled={pending||uploading} onPick={item=>update({[field]:item.url})}/>{cloudinaryConfigured&&<label className="inline-flex min-h-10 cursor-pointer items-center rounded-md border border-border px-3 text-sm">رفع صورة<input type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" className="sr-only" disabled={pending||uploading} onChange={e=>{const file=e.target.files?.[0];e.target.value="";if(file)void upload(file,field);}}/></label>}<button type="button" className="ms-2 min-h-10 text-sm text-destructive" disabled={pending||uploading} onClick={()=>update({[field]:""})}>إزالة</button></div>)}
      {!cloudinaryConfigured&&<p className="text-sm text-foreground-muted">Cloudinary غير مُعد؛ يمكن إدخال رابط صورة HTTPS مباشرة.</p>}
      <label className="block text-sm">عرض اللوجو: {value.headerWidth}px<input className="block w-full max-w-sm" type="range" min={72} max={240} step={4} value={value.headerWidth} disabled={pending||uploading} onChange={e=>update({headerWidth:Number(e.target.value)})}/></label>
      <label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={value.showName} disabled={pending||uploading} onChange={e=>update({showName:e.target.checked})}/>إظهار اسم الوكالة بجانب اللوجو (للرمز المنفرد)</label>
      <p className="text-xs text-foreground-muted">يفضل PNG شفاف أو SVG رسمي. عدم إضافة لوجو للتذييل يعني استخدام لوجو الهيدر. الملفات السابقة لا تُحذف من Cloudinary.</p>
    </div>
    <div className="space-y-3"><h2 className="font-semibold">معاينة قبل الحفظ</h2>{parsed.success?<><div className="rounded-xl bg-gradient-to-r from-[#39247f] to-[#18526e] p-4 text-white"><p className="mb-3 text-xs">Navbar / Desktop</p><BrandLogo assets={parsed.data} brandName={brandName}/></div><div className="max-w-[320px] rounded-xl bg-[#2c1f73] p-4 text-white"><p className="mb-3 text-xs">Mobile</p><BrandLogo assets={parsed.data} brandName={brandName}/></div><div className="rounded-xl bg-[#1a245a] p-5 text-white"><p className="mb-3 text-xs">Footer</p><BrandLogo assets={parsed.data} placement="footer" brandName={brandName}/></div></>:<p className="text-sm text-destructive">راجع روابط الصور والقيم قبل الحفظ.</p>}</div>
    {uploading&&<p role="status">جاري رفع الصورة…</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="text-sm text-emerald-700">{notice}</p>}
    <div className="flex flex-wrap gap-3"><button type="button" disabled={!dirty||!parsed.success||pending||uploading} onClick={save} className="min-h-11 rounded-md bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">{pending?"جاري الحفظ…":"حفظ الهوية"}</button><button type="button" disabled={pending||uploading} onClick={()=>update(defaultBrandAssets())} className="min-h-11 rounded-md border border-border px-4 text-sm">استعادة الافتراضي</button></div></div>;
}
