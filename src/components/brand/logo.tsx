"use client";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { BrandAssets } from "@/lib/content/brand-assets";
type BrandLogoProps={className?:string;href?:string;priority?:boolean;brandName?:string;assets?:BrandAssets;placement?:"header"|"footer"};
export function BrandLogo({className,href="/",priority=false,brandName="Creative Marketing",assets,placement="header"}:BrandLogoProps){
  const [failed,setFailed]=useState<string|null>(null);
  const url=placement==="footer"?assets?.footerLogo||assets?.headerLogo:assets?.headerLogo;
  const showImage=Boolean(url&&failed!==url);
  return <Link href={href} aria-label={brandName+" — الصفحة الرئيسية"} className="inline-flex min-w-0 max-w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-2.5",className)}>
      {showImage?(
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={brandName} loading={priority?"eager":"lazy"} onError={()=>setFailed(url!)} style={{width:assets?.headerWidth??176,maxWidth:assets?.showName?"min(30vw,96px)":"min(58vw,240px)"}} className={cn("block object-contain object-center",placement==="footer"?"h-16":"h-11 sm:h-12")}/>
      ):<span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[image:var(--gradient-cta)] text-sm font-bold text-primary-foreground shadow-soft">CM</span>}
      {(!showImage||assets?.showName)&&<span className="min-w-0 break-words font-headline text-base font-bold text-foreground sm:text-lg">{brandName}</span>}
    </span>
  </Link>;
}
