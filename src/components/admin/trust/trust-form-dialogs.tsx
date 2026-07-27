"use client";

import { Plus, Pencil } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { TrustMetricForm } from "@/components/admin/trust/trust-metric-form";
import { ClientLogoForm } from "@/components/admin/trust/client-logo-form";
import type { ClientLogo, TrustMetric } from "@/generated/prisma";

export function CreateTrustMetricDialog() {
  return (
    <AdminFormDialog
      title="إضافة مؤشر ثقة"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          إضافة رقم ثقة
        </button>
      )}
    >
      {close => <TrustMetricForm onDone={close} />}
    </AdminFormDialog>
  );
}

export function EditTrustMetricDialog({ metric }: { metric: TrustMetric }) {
  return (
    <AdminFormDialog
      title={`تعديل: ${metric.label}`}
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
      )}
    >
      {close => <TrustMetricForm metric={metric} onDone={close} />}
    </AdminFormDialog>
  );
}

export function CreateClientLogoDialog() {
  return (
    <AdminFormDialog
      title="إضافة شعار عميل"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          إضافة لوجو عميل
        </button>
      )}
    >
      {close => <ClientLogoForm onDone={close} />}
    </AdminFormDialog>
  );
}

export function EditClientLogoDialog({ logo }: { logo: ClientLogo }) {
  return (
    <AdminFormDialog
      title={`تعديل: ${logo.name}`}
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
      )}
    >
      {close => <ClientLogoForm logo={logo} onDone={close} />}
    </AdminFormDialog>
  );
}
