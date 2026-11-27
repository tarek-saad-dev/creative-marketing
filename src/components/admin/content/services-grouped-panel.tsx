"use client";

import { useState } from "react";
import {ResilientImage} from "@/components/ui/resilient-media";
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
  readOnly = false,canArchive=false,
}: {
  services: ServiceAdminListItem[];
  readOnly?: boolean;canArchive?:boolean;
}) {
  const [editing, setEditing] = useState<ServiceAdminListItem | null>(null);

  const [query,setQuery]=useState(""),[categoryFilter,setCategoryFilter]=useState("all"),[activeFilter,setActiveFilter]=useState("all");
  const filtered=services.filter(s=>(categoryFilter==="all"||s.category===categoryFilter)&&(activeFilter==="all"||(activeFilter==="active")===s.isActive)&&[s.nameAr,s.nameEn,s.slug].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <div className="admin-card grid gap-3 p-4 sm:grid-cols-3"><label className="text-sm">بحث<input value={query} onChange={e=>setQuery(e.target.value)} className="admin-input mt-1" placeholder="اسم الخدمة"/></label><label className="text-sm">المجموعة<select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="admin-input mt-1"><option value="all">الكل</option>{CATEGORY_ORDER.map(c=><option key={c} value={c}>{GROUP_LABELS[c]}</option>)}</select></label><label className="text-sm">الحالة<select value={activeFilter} onChange={e=>setActiveFilter(e.target.value)} className="admin-input mt-1"><option value="all">الكل</option><option value="active">فعالة</option><option value="inactive">معطلة</option></select></label><p className="text-xs text-foreground-muted sm:col-span-3">{filtered.length} من {services.length} خدمة</p></div>
      <div className="space-y-6">
        {CATEGORY_ORDER.filter(c=>categoryFilter==="all"||categoryFilter===c).map(category => {
          const group = filtered.filter(s => s.category === category);
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
                      {service.imageUrl&&<div className="relative h-28 overflow-hidden rounded-lg bg-[#252c69]"><ResilientImage src={service.imageUrl} alt={service.nameAr} sizes="320px"/></div>}
                      <p className="text-xs text-foreground-muted">{service.projectCount} أعمال مرتبطة · ترتيب {service.displayOrder}</p>
                      <p className="line-clamp-2 text-sm text-foreground-muted">
                        {service.summaryAr}
                      </p>
                      {readOnly ? null : (
                        <div className="mt-auto flex flex-wrap items-center gap-1">
                          {!query&&activeFilter==="all"&&<ServiceMoveControls id={service.id} />}
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
                            isActive={service.isActive} canArchive={canArchive}
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
