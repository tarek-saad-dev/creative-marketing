"use client";

import { useRouter } from "next/navigation";
import { faqInputSchema, type FaqFormInput } from "@/lib/validation/admin/faq";
import {
  createFaqAction,
  updateFaqAction,
} from "@/server/actions/admin/faq.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import { slugify } from "@/lib/utils";
import type { FAQ } from "@/generated/prisma";

export function FaqForm({ faq, onDone }: { faq?: FAQ; onDone: () => void }) {
  const router = useRouter();

  const defaultValues: FaqFormInput = {
    slug: faq?.slug ?? "",
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? "",
    isActive: faq?.isActive ?? true,
    displayOrder: faq?.displayOrder ?? 0,
  };

  return (
    <AdminEntityForm
      schema={faqInputSchema}
      defaultValues={defaultValues}
      action={input =>
        faq ? updateFaqAction(faq.id, input) : createFaqAction(input)
      }
      onSuccess={() => {
        onDone();
        router.refresh();
      }}
    >
      {form => {
        const { register, formState, watch, setValue, getValues } = form;
        return (
          <div className="space-y-4">
            <Field label="السؤال" error={formState.errors.question?.message}>
              <input
                className="admin-input"
                {...register("question")}
                onBlur={event => {
                  register("question").onBlur(event);
                  if (!faq && !getValues("slug")) {
                    setValue(
                      "slug",
                      slugify(watch("question") || event.target.value)
                    );
                  }
                }}
              />
            </Field>
            <Field label="الإجابة" error={formState.errors.answer?.message}>
              <textarea
                className="admin-input min-h-28"
                {...register("answer")}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="القسم (اختياري)"
                error={formState.errors.category?.message}
              >
                <input className="admin-input" {...register("category")} />
              </Field>
              <Field
                label="ترتيب العرض"
                error={formState.errors.displayOrder?.message}
              >
                <input
                  type="number"
                  className="admin-input"
                  {...register("displayOrder")}
                />
              </Field>
            </div>
            <details className="rounded-md border border-border p-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground-muted">
                إعدادات متقدمة (الرابط التلقائي)
              </summary>
              <div className="mt-3">
                <Field
                  label="رابط السؤال"
                  error={formState.errors.slug?.message}
                  hint="يُنشأ تلقائيًا من السؤال"
                >
                  <input
                    className="admin-input"
                    dir="ltr"
                    {...register("slug")}
                  />
                </Field>
              </div>
            </details>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" {...register("isActive")} />
              فعّال على الموقع العام
            </label>
          </div>
        );
      }}
    </AdminEntityForm>
  );
}
