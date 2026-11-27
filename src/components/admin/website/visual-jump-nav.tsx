"use client";
import {useEffect,useRef} from "react";
export function VisualJumpNav({sections}:{sections:{id:string;label:string}[]}){
 const ref=useRef<HTMLElement>(null);
 function jump(hash:string){if(!/^#visual-[a-z0-9]+$/.test(hash))return;const target=document.getElementById(hash.slice(1));if(!target)return;const bar=ref.current?.closest("[data-visual-toolbar]");const top=bar?.getBoundingClientRect().height??144;window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-top-8,behavior:"instant"});}
 useEffect(()=>{function sync(){requestAnimationFrame(()=>jump(location.hash));}sync();window.addEventListener("hashchange",sync);return()=>window.removeEventListener("hashchange",sync);},[]);
 return <nav ref={ref} aria-label="انتقال إلى قسم" className="flex gap-2 overflow-x-auto pb-1">{sections.map(s=><a key={s.id} href={"#visual-"+s.id} onClick={e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();const hash="#visual-"+s.id;history.replaceState(history.state,"",hash);jump(hash);}} className="shrink-0 rounded-full border border-white/25 px-3 py-2 text-xs">{s.label}</a>)}</nav>;
}
