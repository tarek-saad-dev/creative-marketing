"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { AdminMutationResult } from "@/server/auth/admin-mutation";

export function DeleteRowButton({
  id,
  action,
  confirmMessage = "هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.",
  label = "حذف",
}: {
  id: string;
  action: (id: string) => Promise<AdminMutationResult<unknown>>;
  confirmMessage?: string;
  label?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
