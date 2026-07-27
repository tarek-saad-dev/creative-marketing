"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function ConfirmSubmitButton({
  children,
  confirmMessage,
  className,
  variant = "ghost",
}: {
  children: React.ReactNode;
  confirmMessage: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const { pending } = useFormStatus();

  const variantClass = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    danger: "text-destructive hover:bg-destructive/10",
    ghost: "text-foreground-muted hover:bg-muted hover:text-foreground",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={event => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        className
      )}
    >
      {pending ? "…" : children}
    </button>
  );
}
