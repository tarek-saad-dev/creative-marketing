"use client";

import { disablePreviewAction } from "@/server/actions/preview.action";

export function DraftPreviewBanner({ path }: { path: string }) {
  return (
    <div
      className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950"
      role="status"
    >
      <span>وضع المعاينة مفعّل — المحتوى غير المنشور قد يظهر لك فقط.</span>
      <form action={disablePreviewAction.bind(null, path)}>
        <button
          type="submit"
          className="rounded-md bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50"
        >
          إنهاء المعاينة
        </button>
      </form>
    </div>
  );
}
