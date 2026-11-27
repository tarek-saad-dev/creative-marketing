import Link from "next/link";
import {Pencil,ArrowUpLeft} from "lucide-react";
import {sectionNames} from "@/lib/admin/website-workspace";
import {type HomeSectionId} from "@/lib/content/homepage-editor";
import {visualSectionActions} from "@/lib/admin/visual-homepage";
import type {ReactNode} from "react";
export function VisualSection({id,index,enabled,children}:{id:HomeSectionId;index:number;enabled:boolean;children:ReactNode}){
 const actions=visualSectionActions(id);
 return <div id={"visual-"+id} data-visual-section={id} className="relative min-w-0 scroll-mt-[160px] sm:scroll-mt-[120px] border-b border-[#27e8c7]/25">
 <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border border-[#27e8c7]/30 bg-[#18214d] px-4 py-3 text-white sm:rounded-lg sm:px-5">
 <div className="min-w-0"><p className="text-xs font-semibold text-[#27e8c7]">القسم {String(index+1).padStart(2,"0")}</p><p className="mt-1 break-words text-sm font-bold">{sectionNames[id]}</p>{!enabled&&<p className="text-xs text-white/75">مخفي في التخطيط المحفوظ</p>}</div>
 <div className="flex min-w-0 flex-wrap gap-2">{actions.map((action,i)=><Link key={action.href} href={action.href} className={"inline-flex min-h-10 max-w-full items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold "+(i===0?"bg-[#27e8c7] text-[#111827]":"border border-white/30 text-white")}><span>{action.label}</span>{i===0?<Pencil size={14} className="shrink-0"/>:<ArrowUpLeft size={14} className="shrink-0"/>}</Link>)}</div>
 </div>
 {enabled&&children?<div inert>{children}</div>:<div className="mx-auto max-w-7xl px-4 py-8 text-sm leading-7 text-white/85">{enabled?"القسم ده لسه مفيهوش محتوى ظاهر. اضغط تعديل عشان تجهزه.":"هذا القسم مخفي. افتح إعداداته لإظهاره قبل نشر المسودة."}</div>}
 </div>;
}
