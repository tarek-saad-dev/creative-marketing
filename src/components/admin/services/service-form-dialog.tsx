"use client";

import { Plus } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ServiceForm } from "@/components/admin/services/service-form";

export function CreateServiceDialog() {
  return (
    <AdminFormDialog
      title="إضافة خدمة جديدة"
      widthClassName="max-w-2xl"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          إضافة خدمة
        </button>
      )}
    >
      {close => <ServiceForm onDone={close} />}
    </AdminFormDialog>
  );
}
