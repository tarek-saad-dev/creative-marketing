"use client";

import { Plus, Pencil } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { FaqForm } from "@/components/admin/faqs/faq-form";
import type { FAQ } from "@/generated/prisma";

export function CreateFaqDialog() {
  return (
    <AdminFormDialog
      title="إضافة سؤال شائع"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          إضافة سؤال
        </button>
      )}
    >
      {close => <FaqForm onDone={close} />}
    </AdminFormDialog>
  );
}

export function EditFaqDialog({ faq }: { faq: FAQ }) {
  return (
    <AdminFormDialog
      title="تعديل السؤال"
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
      {close => <FaqForm faq={faq} onDone={close} />}
    </AdminFormDialog>
  );
}
