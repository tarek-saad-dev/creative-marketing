"use client";

import { useRouter } from "next/navigation";
import {
  serviceInputSchema,
  type ServiceFormInput,
} from "@/lib/validation/admin/service";
import {
  createServiceAction,
  updateServiceAction,
} from "@/server/actions/admin/service.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import { slugify } from "@/lib/utils";
import type { ServiceCategory } from "@/generated/prisma";

/** Fields the form actually reads — no Date objects (client-safe). */
export type ServiceFormModel = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  category: ServiceCategory;
  summaryAr: string;
  summaryEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
};

const CATEGORY_OPTIONS = [
  { value: "THINK", label: "THINK — استراتيجية" },
  { value: "CREATE", label: "CREATE — إبداع" },
  { value: "BUILD", label: "BUILD — بناء" },
  { value: "GROW", label: "GROW — نمو" },
] as const;

export function ServiceForm({
  service,
  onDone,
}: {
  service?: ServiceFormModel;
  onDone: () => void;
}) {
  const router = useRouter();

  const defaultValues: ServiceFormInput = {
    slug: service?.slug ?? "",
    nameAr: service?.nameAr ?? "",
    nameEn: service?.nameEn ?? "",
    category: service?.category ?? "THINK",
    summaryAr: service?.summaryAr ?? "",
    summaryEn: service?.summaryEn ?? "",
    descriptionAr: service?.descriptionAr ?? "",
    descriptionEn: service?.descriptionEn ?? "",
    icon: service?.icon ?? "",
    imageUrl: service?.imageUrl ?? "",
    isActive: service?.isActive ?? true,
    displayOrder: service?.displayOrder ?? 0,
  };

  return (
    <AdminEntityForm
      schema={serviceInputSchema}
      defaultValues={defaultValues}
      action={input =>
        service
          ? updateServiceAction(service.id, input)
          : createServiceAction(input)
      }
      onSuccess={() => {
        onDone();
        router.refresh();
      }}
    >
      {form => {
        const { register, formState, watch, setValue } = form;
        const nameAr = watch("nameAr");
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="الاسم بالعربية"
              error={formState.errors.nameAr?.message}
            >
              <input
                className="admin-input"
                {...register("nameAr")}
                onBlur={event => {
                  register("nameAr").onBlur(event);
                  if (!service && !form.getValues("slug")) {
                    setValue("slug", slugify(nameAr || event.target.value));
                  }
                }}
              />
            </Field>
            <Field
              label="الاسم بالإنجليزية"
              error={formState.errors.nameEn?.message}
            >
              <input
                className="admin-input"
                dir="ltr"
                {...register("nameEn")}
              />
            </Field>
            <Field
              label="الرابط (slug)"
              error={formState.errors.slug?.message}
              hint="أحرف لاتينية صغيرة وأرقام وشرطات"
            >
              <input className="admin-input" dir="ltr" {...register("slug")} />
            </Field>
            <Field label="الفئة" error={formState.errors.category?.message}>
              <select className="admin-input" {...register("category")}>
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="ملخص عربي"
              error={formState.errors.summaryAr?.message}
            >
              <textarea
                className="admin-input min-h-20"
                {...register("summaryAr")}
              />
            </Field>
            <Field
              label="ملخص إنجليزي"
              error={formState.errors.summaryEn?.message}
            >
              <textarea
                className="admin-input min-h-20"
                dir="ltr"
                {...register("summaryEn")}
              />
            </Field>
            <Field
              label="وصف عربي"
              error={formState.errors.descriptionAr?.message}
            >
              <textarea
                className="admin-input min-h-24"
                {...register("descriptionAr")}
              />
            </Field>
            <Field
              label="وصف إنجليزي"
              error={formState.errors.descriptionEn?.message}
            >
              <textarea
                className="admin-input min-h-24"
                dir="ltr"
                {...register("descriptionEn")}
              />
            </Field>
            <Field
              label="أيقونة (اختياري)"
              error={formState.errors.icon?.message}
            >
              <input className="admin-input" dir="ltr" {...register("icon")} />
            </Field>
            <Field
              label="رابط صورة (اختياري)"
              error={formState.errors.imageUrl?.message}
            >
              <input
                className="admin-input"
                dir="ltr"
                {...register("imageUrl")}
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
              <input type="checkbox" {...register("isActive")} />
              فعّالة على الموقع العام
            </label>
          </div>
        );
      }}
    </AdminEntityForm>
  );
}
