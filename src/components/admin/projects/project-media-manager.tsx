"use client";

import {type MediaLibraryItem} from "@/lib/media/library";
import {MediaPicker} from "@/components/admin/media/media-picker";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  addProjectMediaAction,
  chooseProjectCoverAction,
  removeProjectMediaAction,
  updateProjectMediaAction,
  moveProjectMediaAction,
  dropProjectMediaAction,
} from "@/server/actions/admin/project.action";
import { getCloudinaryUploadSignatureAction } from "@/server/actions/admin/cloudinary.action";
import { videoPoster } from "@/lib/media/public-media";
import { ResilientImage } from "@/components/ui/resilient-media";
import type { AdminProjectDetail } from "@/server/repositories/admin/project.admin.repository";

type MediaRow = AdminProjectDetail["media"][number];

export function ProjectMediaManager({
  projectId,
  projectSlug,
  media,
  cloudinaryConfigured,
  coverImageUrl,
  canAutoCover=false,
}: {
  projectId: string;
  projectSlug: string;
  media: MediaRow[];
  cloudinaryConfigured: boolean;
  coverImageUrl: string | null;
  canAutoCover?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadSummary,setUploadSummary]=useState<string | null>(null);
  const uploadLock=useRef(false);
  const [autoCover,setAutoCover]=useState(true);
  const dragged=useRef<string|null>(null);
  const [dropTarget,setDropTarget]=useState<string|null>(null);

  const sorted = [...media].sort((a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id));

  async function attachLibrary(items:MediaLibraryItem[]){
    if(uploadLock.current||pending||!items.length)return;
    uploadLock.current=true;setError(null);setUploadSummary(null);
    const failures:string[]=[];let done=0;let order=Math.max(-1,...sorted.map(m=>m.displayOrder))+1;
    try{for(const item of items){if(sorted.some(m=>m.url===item.url)){failures.push(item.name+": الملف موجود بالفعل");continue;}setUploadProgress("إضافة "+(done+failures.length+1)+" من "+items.length+" · "+item.name);try{const result=await addProjectMediaAction({projectId,type:item.type,url:item.url,autoCover:canAutoCover&&!coverImageUrl&&autoCover,altText:item.altText,thumbnailUrl:item.type==="VIDEO"?(videoPoster(item.url,item.thumbnailUrl)||""):"",width:item.width,height:item.height,displayOrder:order});if(!result.ok)throw new Error(result.error);done++;order++;}catch(e){failures.push(item.name+": "+(e instanceof Error?e.message:"تعذر الإضافة"));}}setUploadSummary("تم إضافة "+done+" من "+items.length+" ملفات إلى المشروع.");if(failures.length)setError(failures.join("\n"));refresh();}finally{uploadLock.current=false;setUploadProgress(null);}
  }

  function refresh() {
    router.refresh();
  }

  async function attachFromUrl(formData: FormData) {
    if (uploadLock.current) return;
    setError(null);
    const type = String(formData.get("type") ?? "IMAGE") as "IMAGE" | "VIDEO";
    const url = String(formData.get("url") ?? "").trim();
    const altText = String(formData.get("altText") ?? "").trim();
    const caption = String(formData.get("caption") ?? "").trim();
    if (!url) {
      setError("رابط الملف مطلوب");
      return;
    }
    startTransition(async () => {
      const result = await addProjectMediaAction({
        projectId,
        autoCover:canAutoCover&&!coverImageUrl&&autoCover,
        type,
        url,
        altText,
        caption,
        displayOrder: Math.max(-1, ...sorted.map(item=>item.displayOrder)) + 1,
        thumbnailUrl: type === "VIDEO" ? (videoPoster(url, String(formData.get("thumbnailUrl") ?? "").trim()) || "") : "",
        cloudinaryPublicId: "",
        resourceType: type === "VIDEO" ? "video" : "image",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  async function uploadFile(file: File, type: "IMAGE" | "VIDEO", displayOrder: number) {
    const sig = await getCloudinaryUploadSignatureAction({ folderKey: "projects", projectSlug });
    if (!sig.ok) throw new Error(sig.error);
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sig.data.apiKey);
    body.append("timestamp", String(sig.data.timestamp));
    body.append("signature", sig.data.signature);
    body.append("folder", sig.data.folder);
    const response = await fetch("https://api.cloudinary.com/v1_1/" + sig.data.cloudName + "/" + (type === "VIDEO" ? "video" : "image") + "/upload", { method: "POST", body });
    if (!response.ok) throw new Error("فشل رفع الملف إلى Cloudinary");
    const raw = (await response.json()) as {
      public_id: string; secure_url: string; resource_type: string; format?: string;
      bytes?: number; width?: number; height?: number; duration?: number; eager?: Array<{secure_url:string}>;
    };
    const result = await addProjectMediaAction({
      projectId,type,url:raw.secure_url,autoCover:canAutoCover&&!coverImageUrl&&autoCover,
      thumbnailUrl:type==="VIDEO" ? (videoPoster(raw.secure_url,raw.eager?.[0]?.secure_url)||"") : raw.secure_url,
      altText:"",caption:"",displayOrder,cloudinaryPublicId:raw.public_id,
      resourceType:raw.resource_type,format:raw.format??"",bytes:raw.bytes??null,
      width:raw.width??null,height:raw.height??null,duration:raw.duration??null,
    });
    if (!result.ok) throw new Error("رُفع الملف ولكن تعذر ربطه بالمشروع: " + result.error+" — "+raw.secure_url);
  }

  async function uploadBatch(files: File[]) {
    if (!files.length || uploadLock.current || pending) return;
    uploadLock.current=true;
    setError(null);setUploadSummary(null);
    const failures:string[]=[];
    let success=0;
    let nextOrder=Math.max(-1,...sorted.map(item=>item.displayOrder))+1;
    try {
      for (const [index,file] of files.entries()) {
        setUploadProgress("جاري رفع " + (index+1) + " من " + files.length + ": " + file.name);
        try {
          const type=file.type.startsWith("image/")?"IMAGE":file.type.startsWith("video/")?"VIDEO":null;
          if(!type) throw new Error("صيغة غير مدعومة؛ اختر صورة أو فيديو");
          if(file.size>(type==="IMAGE"?10:100)*1024*1024)throw new Error("الحد الأقصى للصور 10 MB والفيديو 100 MB");
          await uploadFile(file,type,nextOrder);
          nextOrder++;
          success++;
        } catch(error) {
          failures.push(file.name+": "+(error instanceof Error?error.message:"تعذر الرفع"));
        }
      }
      setUploadSummary("تم إضافة "+success+" من "+files.length+" ملفات إلى المشروع.");
      if(failures.length)setError(failures.join("\n"));
      refresh();
    } finally {
      uploadLock.current=false;
      setUploadProgress(null);
    }
  }

  async function move(mediaId: string, direction: -1 | 1) {
    if (uploadLock.current || pending) return;
    setError(null);
    startTransition(async () => {
      const result=await moveProjectMediaAction(projectId,mediaId,direction);
      if(!result.ok)setError(result.error);
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{[{label:"الصور",value:sorted.filter(m=>m.type==="IMAGE").length},{label:"الفيديوهات",value:sorted.filter(m=>m.type==="VIDEO").length},{label:"الغلاف",value:coverImageUrl?"محدد":"مطلوب"}].map(stat=><div key={stat.label} className="rounded-lg border border-border bg-muted/30 p-3"><p className="text-xs text-foreground-muted">{stat.label}</p><p className="mt-1 font-bold">{stat.value}</p></div>)}</div>

      {canAutoCover&&!coverImageUrl&&<label className="flex min-h-11 items-center gap-2 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={autoCover} disabled={pending||Boolean(uploadProgress)} onChange={e=>setAutoCover(e.target.checked)}/>استخدم أول صورة تُرفع كغلاف للمسودة (لن يستبدل غلافًا موجودًا)</label>}
      {cloudinaryConfigured ? (
        <div className="space-y-3 rounded-xl border border-dashed border-border p-4" onDragOver={e=>{if(e.dataTransfer.types.includes("Files"))e.preventDefault();}} onDrop={e=>{if(!e.dataTransfer.files.length)return;e.preventDefault();void uploadBatch(Array.from(e.dataTransfer.files));}}>
          <p className="font-semibold">١. ارفع التصميمات من جهازك</p>
          <p className="text-xs text-foreground-muted">اختر أو اسحب أكثر من ملف هنا. يتم الرفع بالترتيب، وتظهر نتيجة كل ملف في حالة الخطأ.</p>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            اختيار الملفات
            <input type="file" multiple accept="image/*,video/*" className="sr-only" disabled={pending || Boolean(uploadProgress)} onChange={event=>{const files=Array.from(event.target.files||[]);event.target.value="";void uploadBatch(files);}} />
          </label>

        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-foreground-muted">
          أضف رابط الصورة. يمكنك استخدام روابط الصور الآن، وربط Cloudinary
          لاحقًا.
        </p>
      )}

      <div className="rounded-lg border border-border p-3"><p className="mb-2 text-sm font-semibold">٢. أو استخدم تصميمات موجودة في المكتبة</p><div className="flex flex-wrap gap-2"><MediaPicker disabled={pending||Boolean(uploadProgress)} onPick={item=>void attachLibrary([item])}/><MediaPicker excludeUrls={sorted.map(m=>m.url)} disabled={pending||Boolean(uploadProgress)} onPickMany={items=>void attachLibrary(items)}/></div></div>
      {uploadProgress&&<p className="break-all text-sm text-foreground-muted" role="status">{uploadProgress}</p>}{uploadSummary&&<p role="status" className="text-sm font-medium text-foreground">{uploadSummary}</p>}
      <details className="rounded-md border border-border bg-muted/40 p-3 text-sm"><summary className="cursor-pointer font-semibold">طريقة إضافة مقارنة قبل وبعد (اختياري)</summary><p className="mt-2">
        لإضافة مقارنة قبل وبعد، اكتب في بداية تعليق صورتين من نفس المشروع
        <code dir="ltr" className="mx-1 inline-block">[before:brand]</code>
        و<code dir="ltr" className="mx-1 inline-block">[after:brand]</code>.
        استخدم نفس المعرّف للزوج، ومعرّفًا مختلفًا لكل مقارنة. أضف بعدها التعليق العادي، ويُفضّل استخدام صورتين بنفس الأبعاد.
      </p></details>
      <p className="text-sm font-semibold">٣. أو أضف ملفًا من رابط</p>
      <form
        className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2"
        action={attachFromUrl}
      >
        <label className="text-sm">
          النوع
          <select name="type" className="admin-input mt-1" defaultValue="IMAGE">
            <option value="IMAGE">صورة</option>
            <option value="VIDEO">فيديو</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          أضف رابط الصورة
          <input name="url" className="admin-input mt-1" dir="ltr" required />
        </label>
        <label className="text-sm sm:col-span-2">رابط صورة معاينة الفيديو (اختياري)<input name="thumbnailUrl" className="admin-input mt-1" dir="ltr" /></label>
        <label className="text-sm">
          نص بديل
          <input name="altText" className="admin-input mt-1" />
        </label>
        <label className="text-sm">
          تعليق
          <input name="caption" className="admin-input mt-1" />
        </label>
        <button
          type="submit"
          disabled={pending || Boolean(uploadProgress)}
          className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground sm:col-span-2 sm:justify-self-start"
        >
          إضافة من رابط
        </button>
      </form>

      {error ? (
        <p role="alert" className="whitespace-pre-line break-words text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <h3 className="font-bold">تصميمات المشروع · اختر الغلاف ورتّب الملفات</h3>
      <p className="text-xs text-foreground-muted">اسحب مقبض الترتيب إلى صف آخر لتغيير موضعه، أو استخدم أزرار أعلى وأسفل على الموبايل.</p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.length === 0 ? (
          <li className="text-sm text-foreground-muted">لا وسائط بعد.</li>
        ) : (
          sorted.map((item, index) => (
            <li
              key={item.id}
              className={"flex min-w-0 flex-col gap-3 rounded-lg border p-3 " + (dropTarget===item.id?"border-primary bg-muted":"border-border")}
              onDragOver={event=>{if(dragged.current && !pending && !uploadProgress){event.preventDefault();event.dataTransfer.dropEffect="move";setDropTarget(item.id);}}}
              onDrop={event=>{event.preventDefault();const source=dragged.current;dragged.current=null;setDropTarget(null);if(!source||source===item.id||pending||uploadLock.current)return;setError(null);startTransition(async()=>{const result=await dropProjectMediaAction(projectId,source,item.id);if(!result.ok)setError(result.error);refresh();});}}
            >
              <span draggable={!pending&&!uploadProgress} onDragStart={event=>{dragged.current=item.id;event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",item.id);}} onDragEnd={()=>{dragged.current=null;setDropTarget(null);}} className="cursor-grab select-none rounded border border-border px-2 py-3 text-lg text-foreground-muted" title="اسحب لإعادة الترتيب" aria-hidden="true">⠿</span>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-[#252c69]"><ResilientImage src={item.type === "VIDEO" ? videoPoster(item.url,item.thumbnailUrl) : item.url} alt={item.altText || "معاينة الوسيط"} sizes="(max-width:640px) 100vw, 340px" fit="contain" /></div>
              <div className="w-full min-w-0 flex-1 space-y-2 text-sm">
                <p>
                  {item.type} · ترتيب {index + 1}{item.width && item.height ? " · " + item.width + " × " + item.height : ""}
                </p>
                <form
                  className="grid gap-2 sm:grid-cols-2"
                  onSubmit={event => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    startTransition(async () => {
                      const result = await updateProjectMediaAction(item.id, {
                        altText: String(data.get("altText") ?? ""),
                        caption: String(data.get("caption") ?? ""),
                        displayOrder: item.displayOrder,
                      });
                      if (!result.ok) setError(result.error);
                      else refresh();
                    });
                  }}
                >
                  <input
                    name="altText"
                    defaultValue={item.altText ?? ""}
                    placeholder="نص بديل"
                    className="admin-input"
                    aria-label={`نص بديل للوسيط ${index + 1}`}
                  />
                  <input
                    name="caption"
                    defaultValue={item.caption ?? ""}
                    placeholder="تعليق"
                    className="admin-input"
                    aria-label={`تعليق للوسيط ${index + 1}`}
                  />
                  <button
                    type="submit"
                    disabled={pending || Boolean(uploadProgress)}
                    className="h-9 rounded-md border border-border px-3 text-xs"
                  >
                    حفظ الوصف
                  </button>
                </form>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.type === "IMAGE" && <button type="button" className={"min-h-10 rounded border px-3 text-xs font-semibold "+(coverImageUrl===item.url?"border-emerald-300 bg-emerald-50 text-emerald-800":"border-primary text-primary")} disabled={pending || Boolean(uploadProgress) || coverImageUrl === item.url} onClick={()=>{setError(null);startTransition(async()=>{const result=await chooseProjectCoverAction(projectId,item.id);if(!result.ok)setError(result.error);else refresh();});}}>{coverImageUrl===item.url?"الغلاف الحالي":"استخدم كغلاف"}</button>}
                <button
                  type="button"
                  className="h-8 rounded border border-border px-2 text-xs"
                  disabled={pending || Boolean(uploadProgress) || index === 0}
                  onClick={() => void move(item.id, -1)}
                >
                  أعلى
                </button>
                <button
                  type="button"
                  className="h-8 rounded border border-border px-2 text-xs"
                  disabled={pending || Boolean(uploadProgress) || index === sorted.length - 1}
                  onClick={() => void move(item.id, 1)}
                >
                  أسفل
                </button>
                <button
                  type="button"
                  className="h-8 rounded border border-destructive/40 px-2 text-xs text-destructive"
                  disabled={pending || Boolean(uploadProgress)}
                  onClick={() => {
                    if (
                      window.confirm(
                        "فصل الوسيط عن المشروع؟ لن يُحذف ملف Cloudinary تلقائيًا."
                      )
                    ) {
                      startTransition(async () => {
                        const result = await removeProjectMediaAction(item.id);
                        if (!result.ok) setError(result.error);
                        else refresh();
                      });
                    }
                  }}
                >
                  فصل
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
