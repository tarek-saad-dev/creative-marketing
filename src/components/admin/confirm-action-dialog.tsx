"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

export function ConfirmActionDialog({
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  onConfirm,
  trigger,
  destructive = false,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error,setError]=useState("");

  return (
    <>
      <span
        onClick={() => {setError("");setOpen(true);}}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setError("");setOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {trigger}
      </span>
      <Dialog
        open={open}
        onClose={() => !pending && setOpen(false)}
        className="relative z-modal admin-shell"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="admin-shell w-full max-w-md rounded-xl bg-card p-5 text-foreground shadow-lg">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <p className="mt-2 text-sm text-foreground-muted">{description}</p>
            {error&&<p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-md border border-border px-3 text-sm"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={pending}
                className={
                  destructive
                    ? "h-9 rounded-md bg-destructive px-3 text-sm text-white"
                    : "h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground"
                }
                onClick={() => {
                  setPending(true);
                  setError("");
                  void Promise.resolve().then(onConfirm).then(()=>setOpen(false)).catch(()=>setError("تعذر تنفيذ الإجراء. حاول مرة أخرى.")).finally(()=>setPending(false));
                }}
              >
                {pending ? "…" : confirmLabel}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
