"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";

/**
 * Headless UI dialogs portal to `document.body`, outside `.admin-shell`.
 * The panel re-applies `admin-shell` so the light admin theme tokens
 * (bg-card, text-foreground, …) still resolve correctly inside the portal.
 * On narrow phones the dialog becomes a full-screen sheet.
 */
export function AdminFormDialog({
  trigger,
  title,
  description,
  children,
  widthClassName = "max-w-lg",
}: {
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  description?: string;
  children: (close: () => void) => React.ReactNode;
  widthClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      {trigger(() => setIsOpen(true))}
      {isOpen ? (
        <Dialog open onClose={close} className="relative z-modal admin-shell">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="fixed inset-0 flex items-stretch justify-center overflow-y-auto sm:items-center sm:p-4">
            <DialogPanel
              className={`admin-shell flex w-full flex-col border-border bg-card shadow-floating sm:my-8 sm:max-h-[min(92vh,900px)] sm:rounded-2xl sm:border ${widthClassName} min-h-full rounded-none border-0 p-4 sm:min-h-0 sm:p-5`}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <DialogTitle className="font-headline text-lg font-bold text-foreground">
                    {title}
                  </DialogTitle>
                  {description ? (
                    <p className="mt-0.5 text-xs text-foreground-muted">
                      {description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="إغلاق"
                  className="shrink-0 rounded-md p-2 text-foreground-muted hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto pb-20 sm:pb-0">
                {children(close)}
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}
