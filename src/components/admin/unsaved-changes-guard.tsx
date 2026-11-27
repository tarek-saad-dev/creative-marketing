"use client";
import {useLayoutEffect,useRef} from "react";

/** Protect reloads and ordinary same-tab internal link navigation. */
export function UnsavedChangesGuard({dirty}:{dirty:boolean}){
 const marker=useRef<HTMLSpanElement>(null);
 const dirtyRef=useRef(dirty);
 useLayoutEffect(()=>{dirtyRef.current=dirty;},[dirty]);
 useLayoutEffect(()=>{
  let confirmed=false;
  let resetTimer:number|undefined;
  function onBeforeUnload(event:BeforeUnloadEvent){
   if(!dirtyRef.current||confirmed)return;
   event.preventDefault();event.returnValue="";
  }
  function onClick(event:MouseEvent){
   if(!dirtyRef.current||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest("a[href]"):null;
   if(!(anchor instanceof HTMLAnchorElement)||anchor.hasAttribute("download")||(anchor.target&&anchor.target!=="_self"))return;
   const target=new URL(anchor.href,location.href);
   if(target.origin!==location.origin)return;
   if(target.pathname===location.pathname&&target.search===location.search)return;
   if(!window.confirm("عندك تعديلات غير محفوظة. هل تريد المغادرة بدون حفظ؟")){
    event.preventDefault();event.stopImmediatePropagation();return;
   }
   confirmed=true;
   if(resetTimer!==undefined)window.clearTimeout(resetTimer);
   resetTimer=window.setTimeout(()=>{confirmed=false;},1000);
  }
  window.addEventListener("click",onClick,true);
  window.addEventListener("beforeunload",onBeforeUnload);
  const node=marker.current;
  if(node)node.dataset.ready="true";
  return ()=>{
   window.removeEventListener("click",onClick,true);
   window.removeEventListener("beforeunload",onBeforeUnload);
   if(resetTimer!==undefined)window.clearTimeout(resetTimer);
   if(node)delete node.dataset.ready;
  };
 },[]);
 return <span ref={marker} data-unsaved-changes-guard hidden aria-hidden="true"/>;
}
