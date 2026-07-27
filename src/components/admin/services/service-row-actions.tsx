"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  archiveServiceAction,
  toggleServiceActiveAction,
} from "@/server/actions/admin/service.action";

export function ServiceRowActions({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleServiceActiveAction(id, !isActive);
      router.refresh();
    });
  }

  function archive() {
    if (!window.confirm("أرشفة هذه الخدمة؟ لن تظهر في الموقع العام.")) return;
    startTransition(async () => {
      const result = await archiveServiceAction(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={toggle}
        className="inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold text-foreground-muted hover:bg-muted hover:text-foreground disabled:opacity-50"
      >
        {isActive ? "تعطيل" : "تفعيل"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={archive}
        className="inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
      >
        أرشفة
      </button>
    </div>
  );
}
