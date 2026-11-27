"use client";

import { useRouter } from "next/navigation";
import { useState,useTransition } from "react";
import { cn } from "@/lib/utils";
import type { AdminMutationResult } from "@/server/auth/admin-mutation";

export function RowActionButton({
  id,
  action,
  label,
  confirmMessage,
  variant = "default",
  className,
  disabled = false,
}: {
  id: string;
  action: (id: string) => Promise<AdminMutationResult<unknown>>;
  label: string;
  confirmMessage?: string;
  variant?: "default" | "primary" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error,setError]=useState("");

  function handleClick() {
    if (disabled || isPending) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setError("");
    startTransition(async () => {
      try{const result=await action(id);if(!result.ok){setError(result.error);return;}router.refresh();}catch{setError("تعذر تنفيذ الإجراء. أعد تحميل الصفحة للتحقق من الحالة.");}
    });
  }

  const variantClass = {
    default: "text-foreground-muted hover:bg-muted hover:text-foreground",
    primary: "text-primary hover:bg-primary/10",
    danger: "text-destructive hover:bg-destructive/10",
  }[variant];

  return (
    <span className="inline-flex min-w-0 flex-col items-start">
    <button
      type="button"
      disabled={isPending || disabled}
      onClick={handleClick}
      className={cn(
        "inline-flex min-h-10 items-center rounded-md px-2 text-xs font-semibold disabled:opacity-50",
        variantClass,
        className
      )}
    >
      {isPending ? "…" : label}
    </button>
    {error&&<span role="alert" className="max-w-64 break-words text-xs text-destructive">{error}</span>}
    </span>
  );
}
