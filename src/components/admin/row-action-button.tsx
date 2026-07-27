"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { AdminMutationResult } from "@/server/auth/admin-mutation";

export function RowActionButton({
  id,
  action,
  label,
  confirmMessage,
  variant = "default",
  className,
}: {
  id: string;
  action: (id: string) => Promise<AdminMutationResult<unknown>>;
  label: string;
  confirmMessage?: string;
  variant?: "default" | "primary" | "danger";
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  const variantClass = {
    default: "text-foreground-muted hover:bg-muted hover:text-foreground",
    primary: "text-primary hover:bg-primary/10",
    danger: "text-destructive hover:bg-destructive/10",
  }[variant];

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={cn(
        "inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold disabled:opacity-50",
        variantClass,
        className
      )}
    >
      {isPending ? "…" : label}
    </button>
  );
}
