"use client";
import {useState} from "react";
import {Dialog,DialogPanel,DialogTitle} from "@headlessui/react";
import {Images} from "lucide-react";
import {listMediaLibraryAction} from "@/server/actions/admin/media-library.action";
import {MediaLibrary} from "./media-library";
import type {MediaLibraryItem} from "@/lib/media/library";
export function MediaPicker({onPick,imagesOnly=false,disabled=false}:{onPick:(item:MediaLibraryItem)=>void;imagesOnly?:boolean;disabled?:boolean}){
 const [open,setOpen]=useState(false),[items,setItems]=useState<MediaLibraryItem[]|null>(null),[error,setError]=useState("");
 async function show(){setOpen(true);setItems(null);setError("");try{const r=await listMediaLibraryAction();if(r.ok)setItems(r.data);else setError(r.error);}catch{setError("تعذر تحميل المكتبة");}}
 return <><button type="button" disabled={disabled} onClick={()=>void show()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold disabled:opacity-40"><Images size={16}/>اختيار من المكتبة</button><Dialog open={open} onClose={()=>setOpen(false)} className="relative z-modal admin-shell"><div className="fixed inset-0 bg-black/50" aria-hidden="true"/><div className="fixed inset-0 flex items-center justify-center p-3"><DialogPanel className="admin-shell max-h-[85dvh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl"><div className="mb-4 flex items-center justify-between gap-3"><DialogTitle className="font-headline text-lg font-bold">مكتبة الوسائط</DialogTitle><button type="button" onClick={()=>setOpen(false)} className="min-h-10 px-3 text-sm">إغلاق</button></div>{error?<p role="alert" className="text-destructive">{error}</p>:items?<MediaLibrary items={items} imagesOnly={imagesOnly} onPick={item=>{setOpen(false);onPick(item);}}/>:<p role="status">جاري تحميل المكتبة…</p>}</DialogPanel></div></Dialog></>;
}
