"use client";

import { Plus, Pencil } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";
import type { Testimonial } from "@/generated/prisma";

export function CreateTestimonialDialog() {
  return (
    <AdminFormDialog
      title="إضافة رأي عميل"
      widthClassName="max-w-2xl"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          إضافة رأي عميل
        </button>
      )}
    >
      {close => <TestimonialForm onDone={close} />}
    </AdminFormDialog>
  );
}

export function EditTestimonialDialog({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <AdminFormDialog
      title={`تعديل: ${testimonial.clientName}`}
      widthClassName="max-w-2xl"
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
      {close => <TestimonialForm testimonial={testimonial} onDone={close} />}
    </AdminFormDialog>
  );
}
