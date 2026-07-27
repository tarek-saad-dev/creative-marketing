"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Menu, Sparkles, X } from "lucide-react";
import { AdminSidebarNav } from "./admin-sidebar";

export function AdminMobileNav({ leadsNew = 0 }: { leadsNew?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>
      {isOpen ? (
        <Dialog
          open
          onClose={() => setIsOpen(false)}
          className="relative z-modal admin-shell lg:hidden"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="fixed inset-y-0 start-0 flex w-72 max-w-[85vw]">
            <DialogPanel className="admin-shell flex w-full flex-col bg-primary">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-2 text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="font-headline text-sm font-bold">
                    لوحة التحكم
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="إغلاق"
                  className="rounded-md p-1.5 text-white/80 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto px-3 pb-6 [&_.admin-nav-link]:text-white/75 [&_.admin-nav-link:hover]:bg-white/10 [&_.admin-nav-link:hover]:text-white [&_.admin-nav-link[data-active='true']]:bg-white [&_.admin-nav-link[data-active='true']]:text-primary"
                onClick={() => setIsOpen(false)}
              >
                <AdminSidebarNav badgeCounts={{ leadsNew }} />
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}
