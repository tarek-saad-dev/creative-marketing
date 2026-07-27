"use client";

import { useRouter } from "next/navigation";
import {
  testimonialInputSchema,
  type TestimonialFormInput,
} from "@/lib/validation/admin/testimonial";
import {
  createTestimonialAction,
  updateTestimonialAction,
} from "@/server/actions/admin/testimonial.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import type { Testimonial } from "@/generated/prisma";

export function TestimonialForm({
  testimonial,
  onDone,
}: {
  testimonial?: Testimonial;
  onDone: () => void;
}) {
  const router = useRouter();

  const defaultValues: TestimonialFormInput = {
    clientName: testimonial?.clientName ?? "",
    projectName: testimonial?.projectName ?? "",
    industry: testimonial?.industry ?? "",
    quote: testimonial?.quote ?? "",
    clientImageUrl: testimonial?.clientImageUrl ?? "",
    clientLogoUrl: testimonial?.clientLogoUrl ?? "",
    screenshotUrl: testimonial?.screenshotUrl ?? "",
    serviceLabel: testimonial?.serviceLabel ?? "",
    publicApprovalConfirmed: testimonial?.publicApprovalConfirmed ?? false,
    displayOrder: testimonial?.displayOrder ?? 0,
  };

  return (
    <AdminEntityForm
      schema={testimonialInputSchema}
      defaultValues={defaultValues}
      action={input =>
        testimonial
          ? updateTestimonialAction(testimonial.id, input)
          : createTestimonialAction(input)
      }
      onSuccess={() => {
        onDone();
        router.refresh();
      }}
    >
      {form => {
        const { register, formState } = form;
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="اسم العميل"
              error={formState.errors.clientName?.message}
            >
              <input className="admin-input" {...register("clientName")} />
            </Field>
            <Field
              label="اسم المشروع (اختياري)"
              error={formState.errors.projectName?.message}
            >
              <input className="admin-input" {...register("projectName")} />
            </Field>
            <Field
              label="المجال (اختياري)"
              error={formState.errors.industry?.message}
            >
              <input className="admin-input" {...register("industry")} />
            </Field>
            <Field
              label="تصنيف الخدمة (اختياري)"
              error={formState.errors.serviceLabel?.message}
            >
              <input className="admin-input" {...register("serviceLabel")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="نص الرأي" error={formState.errors.quote?.message}>
                <textarea
                  className="admin-input min-h-24"
                  {...register("quote")}
                />
              </Field>
            </div>
            <Field
              label="رابط صورة العميل (اختياري)"
              error={formState.errors.clientImageUrl?.message}
            >
              <input
                className="admin-input"
                dir="ltr"
                {...register("clientImageUrl")}
              />
            </Field>
            <Field
              label="رابط شعار العميل (اختياري)"
              error={formState.errors.clientLogoUrl?.message}
            >
              <input
                className="admin-input"
                dir="ltr"
                {...register("clientLogoUrl")}
              />
            </Field>
            <Field
              label="رابط لقطة شاشة (اختياري)"
              error={formState.errors.screenshotUrl?.message}
            >
              <input
                className="admin-input"
                dir="ltr"
                {...register("screenshotUrl")}
              />
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
            <label className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:col-span-2">
              <input
                type="checkbox"
                className="mt-0.5"
                {...register("publicApprovalConfirmed")}
              />
              <span>
                أؤكد أن العميل وافق صراحة على نشر اسمه/صورته/رأيه علنًا على
                الموقع. لا يمكن نشر هذا الرأي بدون هذا التأكيد.
              </span>
            </label>
          </div>
        );
      }}
    </AdminEntityForm>
  );
}
