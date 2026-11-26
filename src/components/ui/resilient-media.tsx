"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Film } from "lucide-react";
import { canUseNextImage, isUsableMediaUrl } from "@/lib/media/public-media";

export function ResilientImage({ src, alt, sizes = "100vw", priority = false, className = "", fit = "contain" }: {
  src: string | null | undefined; alt: string; sizes?: string; priority?: boolean; className?: string; fit?: "contain" | "cover";
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const [rawFallback, setRawFallback] = useState<string | null>(null);
  if (!isUsableMediaUrl(src) || failed === src) return (
    <span role="img" aria-label={alt + " — الصورة غير متاحة"} className="absolute inset-0 grid place-content-center justify-items-center gap-2 bg-[#303874] p-3 text-center text-xs text-white"><ImageOff size={25} aria-hidden="true" /><span>الصورة غير متاحة حاليًا</span></span>
  );
  const style = {objectFit: fit} as const;
  if (canUseNextImage(src) && rawFallback !== src) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} style={style} onError={()=>setRawFallback(src)} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading={priority?"eager":"lazy"} className={"absolute inset-0 h-full w-full " + className} style={style} onError={()=>setFailed(src)} />
  );
}

export function ResilientVideo({ src, poster, label, className = "" }: {src:string;poster?:string|null;label:string;className?:string}) {
  const [failed,setFailed]=useState<string|null>(null);
  if (!isUsableMediaUrl(src) || failed===src) return <div role="status" className={"grid min-h-32 place-content-center justify-items-center gap-2 rounded-xl bg-[#303874] p-4 text-center text-sm text-white "+className}><Film size={30} aria-hidden="true"/>الفيديو غير متاح للتشغيل حاليًا.</div>;
  return <video key={src} controls playsInline preload="none" src={src} poster={poster || undefined} aria-label={label} className={className} onError={()=>setFailed(src)} />;
}
