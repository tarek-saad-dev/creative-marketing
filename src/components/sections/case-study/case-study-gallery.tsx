"use client";

import { useMemo, useState } from "react";
import { ResilientImage } from "@/components/ui/resilient-media";
import { cn } from "@/lib/utils";
import { videoPoster, isUsableMediaUrl } from "@/lib/media/public-media";
import {
  CaseStudyLightbox,
  type GalleryLightboxItem,
} from "@/components/sections/case-study/case-study-lightbox";

type GalleryItem = GalleryLightboxItem;

type CaseStudyGalleryProps = {
  items: GalleryItem[];
};

function layoutClass(item: GalleryItem, index: number): string {
  const ratio =
    item.width && item.height && item.height > 0
      ? item.width / item.height
      : null;

  if (index === 0) return "col-span-full";
  if (ratio !== null && ratio < 0.85) return "md:col-span-1";
  if (ratio !== null && ratio > 1.4) return "md:col-span-2";
  if (index % 3 === 0) return "md:col-span-2";
  return "md:col-span-1";
}

export function CaseStudyGallery({ items }: CaseStudyGalleryProps) {
  const usable = useMemo(
    () => items.filter(item => isUsableMediaUrl(item.url)),
    [items]
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (usable.length === 0) return null;

  return (
    <section aria-labelledby="gallery-heading" className="space-y-5">
      <h2
        id="gallery-heading"
        className="font-headline text-2xl font-semibold text-foreground"
      >
        المعرض
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {usable.map((item, index) => {
          const figureClass = cn(
            "group relative overflow-hidden rounded-2xl border border-border/40 bg-surface-glass",
            layoutClass(item, index)
          );

          return (
            <figure key={item.id} className={figureClass}>
              <button
                type="button"
                className="relative block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setOpenIndex(index)}
                aria-label={`فتح الوسائط: ${item.altText || item.caption || "عنصر المعرض"}`}
              >
                <div
                  className={cn(
                    "relative w-full bg-[#1a245a]/70",
                    index === 0 ? "aspect-[16/10]" : "aspect-[4/3]"
                  )}
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

      <CaseStudyLightbox
        items={usable}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}
