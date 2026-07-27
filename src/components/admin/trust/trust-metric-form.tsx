"use client";

import { useRouter } from "next/navigation";
import {
  trustMetricInputSchema,
  type TrustMetricFormInput,
} from "@/lib/validation/admin/trust";
import {
  createTrustMetricAction,
  updateTrustMetricAction,
} from "@/server/actions/admin/trust.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import type { TrustMetric } from "@/generated/prisma";

export function TrustMetricForm({
  metric,
  onDone,
}: {
  metric?: TrustMetric;
  onDone: () => void;
}) {
  const router = useRouter();

  const defaultValues: TrustMetricFormInput = {
    key: metric?.key ?? "",
    label: metric?.label ?? "",
    value: metric?.value ?? "",
    prefix: metric?.prefix ?? "",
    suffix: metric?.suffix ?? "",
    isVerified: metric?.isVerified ?? false,
    isActive: metric?.isActive ?? false,
    displayOrder: metric?.displayOrder ?? 0,
  };

  return (
    <AdminEntityForm
      schema={trustMetricInputSchema}
      defaultValues={defaultValues}
      action={input =>
        metric
          ? updateTrustMetricAction(metric.id, input)
          : createTrustMetricAction(input)
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
              label="المفتاح"
              error={formState.errors.key?.message}
              hint="مثال: clients_served"
            >
              <input className="admin-input" dir="ltr" {...register("key")} />
            </Field>
            <Field label="التسمية" error={formState.errors.label?.message}>
              <input className="admin-input" {...register("label")} />
            </Field>
            <Field label="القيمة" error={formState.errors.value?.message}>
              <input className="admin-input" {...register("value")} />
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
            <Field
              label="بادئة (اختياري)"
              error={formState.errors.prefix?.message}
            >
              <input className="admin-input" {...register("prefix")} />
            </Field>
            <Field
              label="لاحقة (اختياري)"
              error={formState.errors.suffix?.message}
            >
              <input className="admin-input" {...register("suffix")} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" {...register("isVerified")} />
              موثّق (verified)
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" {...register("isActive")} />
              فعّال على الموقع العام
            </label>
            <p className="sm:col-span-2 text-xs text-amber-800">
              يظهر المقياس للعامة فقط عندما يكون موثّقًا وفعّالًا معًا. تفعيل
              مقياس غير موثّق لن يعرضه على الصفحة الرئيسية.
            </p>
          </div>
        );
      }}
    </AdminEntityForm>
  );
}
