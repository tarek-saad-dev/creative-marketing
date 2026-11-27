"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowUp,ArrowDown} from "lucide-react";
import {defaultIndustryContent,type IndustryContent,type IndustryId} from "@/lib/content/industry-content";
import {niches} from "@/lib/content/niches";
import {NicheVisual} from "@/components/sections/niches/niche-showcase";
import {ResilientImage} from "@/components/ui/resilient-media";
import {MediaPicker} from "@/components/admin/media/media-picker";
const defaults=defaultIndustryContent();
export function IndustryContentForm({value,onChange,disabled}:{value:IndustryContent;onChange:(v:IndustryContent)=>void;disabled:boolean}){
 const [selected,setSelected]=useState<IndustryId>("salons");
 const card=value.cards[selected],niche=niches.find(n=>n.slug===selected)!;
 function update(patch:Partial<IndustryContent["cards"][IndustryId]>){onChange({...value,cards:{...value.cards,[selected]:{...card,...patch}}});}
 function move(index:number,direction:number){const target=index+direction;if(target<0||target>=3)return;const order=[...value.order];[order[index],order[target]]=[order[target],order[index]];onChange({...value,order});}
 return <div className="space-y-4">
 <p className="text-sm leading-6 text-foreground-muted">عدّل محتوى القسم هنا. التغييرات تظل مسودة حتى تحفظ وتنشر الصفحة.</p>
 {([{key:"kicker",label:"النص الصغير أعلى العنوان",max:100},{key:"title",label:"عنوان مجالاتنا",max:150},{key:"highlight",label:"الكلمة المميزة",max:100},{key:"description",label:"وصف مجالاتنا",max:600}] as const).map(f=><div key={f.key} className="space-y-1 text-sm font-medium"><label htmlFor={"industry-"+f.key}>{f.label}</label><textarea id={"industry-"+f.key} disabled={disabled} className="admin-input min-h-14 w-full" maxLength={f.max} value={value[f.key]} onChange={e=>onChange({...value,[f.key]:e.target.value})}/></div>)}
 <h3 className="font-semibold">بطاقات المجالات</h3>
 <div className="space-y-2">{value.order.map((id,i)=><div key={id} className={"flex flex-wrap items-center gap-1 rounded-lg border p-2 "+(selected===id?"border-primary bg-primary/5":"border-border")}><button type="button" disabled={disabled} aria-pressed={selected===id} onClick={()=>setSelected(id)} className="min-h-10 min-w-0 flex-1 break-words text-start text-sm font-semibold">{value.cards[id].label}</button><button type="button" disabled={disabled||i===0} aria-label={"رفع "+value.cards[id].label} onClick={()=>move(i,-1)} className="grid h-10 w-9 place-items-center rounded border border-border disabled:opacity-35"><ArrowUp size={16}/></button><button type="button" disabled={disabled||i===2} aria-label={"خفض "+value.cards[id].label} onClick={()=>move(i,1)} className="grid h-10 w-9 place-items-center rounded border border-border disabled:opacity-35"><ArrowDown size={16}/></button></div>)}</div>
 <div className="space-y-3 rounded-xl border border-border p-3">
 <div className="overflow-hidden rounded-lg bg-[#2c1f73] text-white">{card.imageUrl?<div className="relative aspect-[4/3]"><ResilientImage src={card.imageUrl} alt={card.imageAlt||card.label} sizes="400px"/></div>:<div className="relative aspect-[4/3] overflow-hidden"><div className="absolute inset-0 scale-75 origin-center"><NicheVisual niche={niche}/></div></div>}<div className="p-3"><p className="text-xs text-[#80f8e5]">{card.eyebrow}</p><p className="break-words font-bold">{card.label}</p></div></div>
 <label className="block text-sm">اسم البطاقة<input className="admin-input mt-1" disabled={disabled} value={card.label} maxLength={120} onChange={e=>update({label:e.target.value})}/></label>
 <label className="block text-sm">النص الإنجليزي الصغير<input className="admin-input mt-1" disabled={disabled} value={card.eyebrow} maxLength={120} onChange={e=>update({eyebrow:e.target.value})}/></label>
 <label className="block text-sm">صورة المجال<input className="admin-input mt-1" dir="ltr" disabled={disabled} value={card.imageUrl} maxLength={2048} placeholder="HTTPS أو اختر من المكتبة" onChange={e=>update({imageUrl:e.target.value})}/></label>
 <MediaPicker imagesOnly disabled={disabled} onPick={item=>update({imageUrl:item.url,imageAlt:card.imageAlt||card.label})}/>
 <label className="block text-sm">وصف الصورة<input className="admin-input mt-1" disabled={disabled} value={card.imageAlt} maxLength={200} onChange={e=>update({imageAlt:e.target.value})}/></label>
 <p className="text-xs leading-6 text-foreground-muted">تظهر الصورة كاملة دون قص. بدون صورة، يظهر النموذج التوضيحي الحالي. الرابط ثابت إلى صفحة المجال: <Link href={niche.path} target="_blank" rel="noopener noreferrer" className="text-primary underline">{niche.label}</Link>.</p>
 <button type="button" disabled={disabled} onClick={()=>update({imageUrl:"",imageAlt:""})} className="text-sm text-primary underline">العودة للصورة التوضيحية</button><button type="button" disabled={disabled} onClick={()=>update(defaults.cards[selected])} className="block text-sm text-primary underline">استعادة بيانات البطاقة الافتراضية</button>
 </div>
 </div>;
}
