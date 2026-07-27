"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ContentStatusBadge } from "@/components/admin/status-badge";
import { ServiceForm } from "@/components/admin/services/service-form";
import { ServiceRowActions } from "@/components/admin/services/service-row-actions";
import type { ServiceCategory } from "@/generated/prisma";

/** Client-safe DTO — no Date objects (avoids RSC→client serialization mismatches). */
export type ServiceAdminListItem = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  category: ServiceCategory;
  summaryAr: string;
  summaryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  projectCount: number;
};

/**
 * One shared Headless UI edit dialog for the whole table.
 * Mounting a Dialog per row (16+) caused intermittent hydration ID mismatches
 * under concurrent navigation in Next.js 16 / React 19.
 */
export function ServicesAdminTable({
  services,
  readOnly = false,
}: {
  services: ServiceAdminListItem[];
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState<ServiceAdminListItem | null>(null);

  return (
    <>
      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الفئة</th>
              <th>الحالة</th>
              <th>أعمال مرتبطة</th>
              <th>الترتيب</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد خدمات بعد.
                </td>
              </tr>
            ) : (
              services.map(service => (
                <tr key={service.id}>
                  <td>
                    <p className="font-medium text-foreground">
                      {service.nameAr}
                    </p>
                    <p className="text-xs text-foreground-muted" dir="ltr">
                      {service.nameEn} · /{service.slug}
                    </p>
                  </td>
                  <td>{service.category}</td>
                  <td>
                    <ContentStatusBadge
                      status={service.isActive ? "PUBLISHED" : "DRAFT"}
                    />
                  </td>
                  <td>{service.projectCount}</td>
                  <td>{service.displayOrder}</td>
                  <td>
                    {readOnly ? null : (
                      <div className="flex items-center justify-end gap-1">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing ? (
        <Dialog
          open
          onClose={() => setEditing(null)}
          className="relative z-modal admin-shell"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
            <DialogPanel className="admin-shell my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-floating">
              <div className="mb-4 flex items-center justify-between gap-4">
                <DialogTitle className="font-headline text-lg font-bold text-foreground">
                  تعديل: {editing.nameAr}
                </DialogTitle>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="إغلاق"
                  className="shrink-0 rounded-md p-1.5 text-foreground-muted hover:bg-muted hover:text-foreground"
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
