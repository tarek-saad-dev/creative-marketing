"use client";

import { useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ResilientImage, ResilientVideo } from "@/components/ui/resilient-media";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { videoPoster } from "@/lib/media/public-media";
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
      if (event.target instanceof HTMLVideoElement || event.target instanceof HTMLInputElement) return;
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
      <div className="fixed inset-0 bg-[#131b45]/90" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6">
        <DialogPanel className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[94rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a245a] shadow-floating">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <DialogTitle className="truncate text-sm text-foreground">
              {item?.caption || item?.altText || "معرض المشروع"}
            </DialogTitle>
            {isOpen && <span className="text-xs text-foreground-muted" dir="ltr">{openIndex! + 1} / {items.length}</span>}
            <IconButton label="إغلاق المعرض" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#202b62]/70 p-2 sm:p-4">
            {item?.type === "VIDEO" ? (
              <ResilientVideo src={item.url} poster={videoPoster(item.url,item.thumbnailUrl)} label={item.altText || "فيديو المشروع"} className="max-h-[min(70dvh,calc(100dvh-8rem))] w-full rounded-lg object-contain" />
            ) : item ? (
              <div className="relative h-[min(70dvh,calc(100dvh-8rem))] w-full"><ResilientImage src={item.url} alt={item.altText || "صورة من المشروع"} /></div>
            ) : null}

            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute start-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-foreground backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="العنصر السابق"
                  onClick={() => onNavigate((openIndex! - 1 + items.length) % items.length)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="absolute end-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-foreground backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="العنصر التالي"
                  onClick={() =>
                    onNavigate((openIndex! + 1) % items.length)
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
