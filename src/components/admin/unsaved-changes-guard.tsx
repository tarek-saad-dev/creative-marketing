"use client";
import {useEffect} from "react";
/** Protect reloads and ordinary same-tab internal link navigation. */
export function UnsavedChangesGuard({dirty}:{dirty:boolean}){
 useEffect(()=>{
  if(!dirty)return;
  let confirmed=false;
  function onBeforeUnload(event:BeforeUnloadEvent){if(confirmed)return;event.preventDefault();event.returnValue="";}
  function onClick(event:MouseEvent){
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest("a[href]"):null;
   if(!(anchor instanceof HTMLAnchorElement)||anchor.hasAttribute("download")||(anchor.target&&anchor.target!=="_self"))return;
   const target=new URL(anchor.href,location.href);
   if(target.origin!==location.origin)return;
   if(target.pathname===location.pathname&&target.search===location.search)return;
   if(!window.confirm("عندك تعديلات غير محفوظة. هل تريد المغادرة بدون حفظ؟")){event.preventDefault();event.stopPropagation();return;}
   confirmed=true;window.setTimeout(()=>{confirmed=false;},1000);
  }
  document.addEventListener("click",onClick,true);window.addEventListener("beforeunload",onBeforeUnload);
  return ()=>{document.removeEventListener("click",onClick,true);window.removeEventListener("beforeunload",onBeforeUnload);};
 },[dirty]);
 return null;
}
