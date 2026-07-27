"use client";

import { useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import Image from "next/image";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { canUseNextImage } from "@/lib/media/public-media";
import { IconButton } from "@/components/ui/icon-button";

export type GalleryLightboxItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

type CaseStudyLightboxProps = {
  items: GalleryLightboxItem[];
  openIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function CaseStudyLightbox({
  items,
  openIndex,
  onClose,
  onNavigate,
}: CaseStudyLightboxProps) {
  const isOpen = openIndex !== null && items[openIndex] != null;
  const item = isOpen ? items[openIndex!] : null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate((openIndex! + 1) % items.length);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate((openIndex! - 1 + items.length) % items.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, openIndex, items.length, onNavigate]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-toast">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6">
        <DialogPanel className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-floating">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm text-foreground">
              {item?.caption || item?.altText || "معرض المشروع"}
            </p>
            <IconButton label="إغلاق المعرض" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>

          <div className="relative flex min-h-[50vh] flex-1 items-center justify-center bg-black/40 p-2 sm:p-4">
            {item?.type === "VIDEO" ? (
              <video
                key={item.id}
                controls
                playsInline
                preload="metadata"
                poster={item.thumbnailUrl ?? undefined}
                className="max-h-[70vh] w-full rounded-lg"
                aria-label={item.altText ?? "فيديو المشروع"}
              >
                <source src={item.url} />
              </video>
            ) : item && canUseNextImage(item.url) ? (
              <div className="relative h-[70vh] w-full">
                <Image
                  src={item.url}
                  alt={item.altText ?? "صورة من المشروع"}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            ) : item ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.altText ?? "صورة من المشروع"}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            ) : null}

            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute start-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-foreground backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="العنصر السابق"
                  onClick={() => onNavigate((openIndex! + 1) % items.length)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="absolute end-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-foreground backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="العنصر التالي"
                  onClick={() =>
                    onNavigate((openIndex! - 1 + items.length) % items.length)
                  }
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
