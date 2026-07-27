"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ToneBadge } from "@/components/admin/status-badge";
import { ServiceForm } from "@/components/admin/services/service-form";
import { ServiceRowActions } from "@/components/admin/services/service-row-actions";
import { ServiceMoveControls } from "@/components/admin/content/reorder-controls";
import type { ServiceCategory } from "@/generated/prisma";
import type { ServiceAdminListItem } from "@/components/admin/services/services-admin-table";

const GROUP_LABELS: Record<ServiceCategory, string> = {
  THINK: "THINK — التخطيط والتحليل",
  CREATE: "CREATE — صناعة المحتوى",
  BUILD: "BUILD — بناء الهوية",
  GROW: "GROW — الإدارة والتطوير",
};

const CATEGORY_ORDER: ServiceCategory[] = ["THINK", "CREATE", "BUILD", "GROW"];

export function ServicesGroupedPanel({
  services,
  readOnly = false,
}: {
  services: ServiceAdminListItem[];
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState<ServiceAdminListItem | null>(null);

  return (
    <>
      <div className="space-y-6">
        {CATEGORY_ORDER.map(category => {
          const group = services.filter(s => s.category === category);
          return (
            <section key={category} className="space-y-3">
              <h3 className="font-headline text-base font-bold text-foreground">
                {GROUP_LABELS[category]}
              </h3>
              {group.length === 0 ? (
                <p className="text-sm text-foreground-muted">
                  لا خدمات في هذه المجموعة بعد.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {group.map(service => (
                    <article
                      key={service.id}
                      className="admin-card flex flex-col gap-3 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {service.nameAr}
                          </h4>
                          <p className="text-xs text-foreground-muted">
                            {service.nameEn}
                          </p>
                        </div>
                        <ToneBadge
                          label={service.isActive ? "فعّالة" : "معطّلة"}
                          tone={service.isActive ? "success" : "neutral"}
                        />
                      </div>
                      <p className="line-clamp-2 text-sm text-foreground-muted">
                        {service.summaryAr}
                      </p>
                      {readOnly ? null : (
                        <div className="mt-auto flex flex-wrap items-center gap-1">
                          <ServiceMoveControls id={service.id} />
                          <button
                            type="button"
                            onClick={() => setEditing(service)}
                            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            تعديل
                          </button>
                          <ServiceRowActions
                            id={service.id}
                            isActive={service.isActive}
                          />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {editing ? (
        <Dialog
          open
          onClose={() => setEditing(null)}
          className="relative z-modal admin-shell"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="fixed inset-0 flex items-stretch justify-center overflow-y-auto sm:items-center sm:p-4">
            <DialogPanel className="admin-shell flex w-full max-w-2xl flex-col border-border bg-card p-4 shadow-floating sm:my-8 sm:rounded-2xl sm:border sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <DialogTitle className="font-headline text-lg font-bold text-foreground">
                  تعديل: {editing.nameAr}
                </DialogTitle>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="إغلاق"
                  className="rounded-md p-2 text-foreground-muted hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ServiceForm
                key={editing.id}
                service={editing}
                onDone={() => setEditing(null)}
              />
            </DialogPanel>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}
