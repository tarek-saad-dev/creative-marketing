"use client";

import { Plus, Pencil } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { SettingForm } from "@/components/admin/settings/setting-form";
import type { SiteSetting } from "@/generated/prisma";

export function CreateSettingDialog() {
  return (
    <AdminFormDialog
      title="إضافة إعداد جديد"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          إضافة إعداد
        </button>
      )}
    >
      {close => <SettingForm onDone={close} />}
    </AdminFormDialog>
  );
}

export function EditSettingDialog({ setting }: { setting: SiteSetting }) {
  return (
    <AdminFormDialog
      title={`تعديل: ${setting.key}`}
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
      {close => <SettingForm setting={setting} onDone={close} />}
    </AdminFormDialog>
  );
}
