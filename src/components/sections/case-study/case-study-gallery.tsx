"use client";

import { useMemo, useState } from "react";
import { ResilientImage } from "@/components/ui/resilient-media";
import { mediaAspectRatio } from "@/lib/media/portfolio-layout";
import { videoPoster, isUsableMediaUrl, isImageCandidate } from "@/lib/media/public-media";
import {
  CaseStudyLightbox,
  type GalleryLightboxItem,
} from "@/components/sections/case-study/case-study-lightbox";

type GalleryItem = GalleryLightboxItem;

type CaseStudyGalleryProps = {
  items: GalleryItem[];
};

export function CaseStudyGallery({ items }: CaseStudyGalleryProps) {
  const usable = useMemo(
    () => items.filter(item => isUsableMediaUrl(item.url) && (item.type === "VIDEO" || isImageCandidate(item.url))),
    [items]
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [limit,setLimit]=useState(12);

  if (usable.length === 0) return null;

  return (
    <section aria-labelledby="gallery-heading" className="space-y-5">
      <h2
        id="gallery-heading"
        className="font-headline text-2xl font-semibold text-foreground"
      >
        المعرض
      </h2>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        {usable.slice(0,limit).map((item, index) => {
          const figureClass = "group relative min-w-0 overflow-hidden rounded-2xl border border-border/40 bg-surface-glass";

          return (
            <figure key={item.id} className={figureClass}>
              <button
                type="button"
                className="relative block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setOpenIndex(index)}
                aria-label={`فتح الوسائط: ${item.altText || item.caption || "عنصر المعرض"}`}
              >
                <div
                  className="relative w-full bg-[#1a245a]/70" style={{aspectRatio:mediaAspectRatio(item.width,item.height,item.type==="VIDEO"?16/9:1)}}
                >
                  {item.type === "VIDEO" ? (
                    <>
                      <ResilientImage src={videoPoster(item.url,item.thumbnailUrl)} alt={item.altText || "معاينة فيديو"} sizes="50vw" />
                      <span className="absolute inset-0 grid place-items-center"><span className="rounded-full bg-[#1a245a] px-4 py-2 text-sm text-white">تشغيل الفيديو</span></span>
                    </>
                  ) : <ResilientImage src={item.url} alt={item.altText || "صورة من المشروع"} sizes="(max-width:768px) 100vw, 50vw" />}
                </div>
              </button>
              {item.caption ? (
                <figcaption className="border-t border-border/30 px-4 py-3 text-sm text-foreground-muted">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>

      {usable.length>limit && <button type="button" onClick={()=>setLimit(value=>value+12)} className="mx-auto block min-h-11 rounded-full border border-white/30 px-5 text-brand-aqua">عرض المزيد من التصميمات</button>}
      <CaseStudyLightbox
        items={usable}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}
