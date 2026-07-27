"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { canUseNextImage, isUsableMediaUrl } from "@/lib/media/public-media";
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
                    "relative w-full",
                    index === 0 ? "aspect-[16/10]" : "aspect-[4/3]"
                  )}
                >
                  {item.type === "VIDEO" ? (
                    <>
                      {item.thumbnailUrl &&
                      canUseNextImage(item.thumbnailUrl) ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.altText ?? "معاينة فيديو"}
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 100vw, 50vw"
                        />
                      ) : canUseNextImage(item.url) && item.type === "VIDEO" ? (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/40 to-background-deep" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/40 to-background-deep" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm text-foreground backdrop-blur-sm">
                          تشغيل الفيديو
                        </span>
                      </span>
                    </>
                  ) : canUseNextImage(item.url) ? (
                    <Image
                      src={item.url}
                      alt={item.altText ?? "صورة من المشروع"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
                      sizes={
                        index === 0 ? "100vw" : "(max-width:768px) 100vw, 50vw"
                      }
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.altText ?? "صورة من المشروع"}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
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
