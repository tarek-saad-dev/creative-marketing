"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  packageInputSchema,
  type PackageFormInput,
} from "@/lib/validation/admin/package";
import {
  createPackageAction,
  updatePackageAction,
} from "@/server/actions/admin/package.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import { slugify } from "@/lib/utils";
import type { Package, PackageFeature } from "@/generated/prisma";

type PackageWithFeatures = Package & { features: PackageFeature[] };

/**
 * Separate named component so `useFieldArray` is called from a proper React
 * component, not an inline render-prop callback.
 *
 * `form` is typed loosely (zod4 + RHF resolver typing is intentionally
 * loosened at this boundary, see `admin-entity-form.tsx`) — the actual
 * runtime shape always matches `PackageFormInput`.
 */
function PackageFormFields({
  form: formProp,
  pkg,
}: {
  form: unknown;
  pkg?: PackageWithFeatures;
}) {
  const form = formProp as UseFormReturn<PackageFormInput>;
  const { register, formState, watch, setValue, getValues, control } = form;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "features",
  });
  const name = watch("name");

  function moveFeature(from: number, to: number) {
    if (to < 0 || to >= fields.length) return;
    move(from, to);
    // Keep displayOrder aligned with visual order for persistence.
    const next = getValues("features");
    next.forEach((_, i) => {
      setValue(`features.${i}.displayOrder`, i, { shouldDirty: true });
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم الباقة" error={formState.errors.name?.message}>
          <input
            className="admin-input"
            {...register("name")}
            onBlur={event => {
              register("name").onBlur(event);
              if (!pkg && !getValues("slug")) {
                setValue("slug", slugify(name || event.target.value));
              }
            }}
          />
        </Field>
        <Field label="الرابط (slug)" error={formState.errors.slug?.message}>
          <input className="admin-input" dir="ltr" {...register("slug")} />
        </Field>
        <Field
          label="الشعار الفرعي (اختياري)"
          error={formState.errors.tagline?.message}
        >
          <input className="admin-input" {...register("tagline")} />
        </Field>
        <Field
          label="مناسبة لـ"
          error={formState.errors.idealFor?.message}
          hint="مطلوب للنشر"
        >
          <input className="admin-input" {...register("idealFor")} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="الوصف" error={formState.errors.description?.message}>
            <textarea
              className="admin-input min-h-20"
              {...register("description")}
            />
          </Field>
        </div>
        <Field
          label="السعر (اختياري حتى الاعتماد)"
          error={formState.errors.originalPrice?.message}
          hint="اتركه فارغًا حتى تحديد السعر الفعلي — مطلوب > 0 للنشر"
        >
          <input
            className="admin-input"
            dir="ltr"
            inputMode="decimal"
            {...register("originalPrice")}
          />
        </Field>
        <Field label="العملة" error={formState.errors.currency?.message}>
          <input className="admin-input" dir="ltr" {...register("currency")} />
        </Field>
        <Field
          label="دورة الفوترة (اختياري)"
          error={formState.errors.billingPeriod?.message}
        >
          <input className="admin-input" {...register("billingPeriod")} />
        </Field>
        <Field
          label="مدة البدء (اختياري)"
          error={formState.errors.startTimeText?.message}
        >
          <input className="admin-input" {...register("startTimeText")} />
        </Field>
        <Field
          label="عدد التعديلات (اختياري)"
          error={formState.errors.revisionCount?.message}
        >
          <input
            type="number"
            className="admin-input"
            {...register("revisionCount")}
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
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground">
          <input type="checkbox" {...register("isFeatured")} />
          باقة مميزة (Featured)
        </label>
        <p className="sm:col-span-2 text-xs text-foreground-muted">
          يمكن تمييز باقة واحدة فقط. عند التفعيل تُلغى المميزة من أي باقة أخرى.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">الميزات</h3>
          <button
            type="button"
            onClick={() =>
              append({
                title: "",
                description: "",
                category: "",
                included: true,
                displayOrder: fields.length,
              })
            }
            className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة ميزة
          </button>
        </div>
        {fields.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-3 text-xs text-foreground-muted">
            لا توجد ميزات بعد — مطلوبة ميزة واحدة على الأقل للنشر.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-wrap items-start gap-2 rounded-md border border-border p-2"
              >
                <input
                  className="admin-input flex-[2] min-w-40"
                  placeholder="عنوان الميزة"
                  {...register(`features.${index}.title` as const)}
                />
                <input
                  className="admin-input flex-[2] min-w-40"
                  placeholder="وصف (اختياري)"
                  {...register(`features.${index}.description` as const)}
                />
                <input
                  className="admin-input flex-1 min-w-28"
                  placeholder="تصنيف (اختياري)"
                  {...register(`features.${index}.category` as const)}
                />
                <label className="flex h-10 items-center gap-1.5 text-xs text-foreground">
                  <input
                    type="checkbox"
                    {...register(`features.${index}.included` as const)}
                  />
                  متضمنة
                </label>
                <div className="flex h-10 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveFeature(index, index - 1)}
                    disabled={index === 0}
                    className="flex h-10 w-9 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground disabled:opacity-40"
                    aria-label={`نقل الميزة للأعلى (الموضع الحالي ${index + 1} من ${fields.length})`}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeature(index, index + 1)}
                    disabled={index === fields.length - 1}
                    className="flex h-10 w-9 items-center justify-center rounded-md text-foreground-muted hover:bg-muted hover:text-foreground disabled:opacity-40"
                    aria-label={`نقل الميزة للأسفل (الموضع الحالي ${index + 1} من ${fields.length})`}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                  aria-label="حذف الميزة"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PackageForm({
  pkg,
  onDone,
}: {
  pkg?: PackageWithFeatures;
  onDone: () => void;
}) {
  const router = useRouter();

  const defaultValues: PackageFormInput = {
    slug: pkg?.slug ?? "",
    name: pkg?.name ?? "",
    tagline: pkg?.tagline ?? "",
    description: pkg?.description ?? "",
    idealFor: pkg?.idealFor ?? "",
    originalPrice: pkg?.originalPrice ? pkg.originalPrice.toString() : "",
    currency: pkg?.currency ?? "SAR",
    billingPeriod: pkg?.billingPeriod ?? "",
    startTimeText: pkg?.startTimeText ?? "",
    revisionCount: pkg?.revisionCount ?? null,
    isFeatured: pkg?.isFeatured ?? false,
    displayOrder: pkg?.displayOrder ?? 0,
    features:
      pkg?.features.map(feature => ({
        title: feature.title,
        description: feature.description ?? "",
        category: feature.category ?? "",
        included: feature.included,
        displayOrder: feature.displayOrder,
      })) ?? [],
  };

  return (
    <AdminEntityForm
      schema={packageInputSchema}
      defaultValues={defaultValues}
      action={input =>
        pkg ? updatePackageAction(pkg.id, input) : createPackageAction(input)
      }
      onSuccess={() => {
        onDone();
        router.refresh();
      }}
    >
      {form => (
        <PackageFormFields
          form={form as UseFormReturn<PackageFormInput>}
          pkg={pkg}
        />
      )}
    </AdminEntityForm>
  );
}
