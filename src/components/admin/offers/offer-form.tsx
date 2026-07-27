"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  offerInputSchema,
  type OfferFormInput,
} from "@/lib/validation/admin/offer";
import {
  createOfferAction,
  updateOfferAction,
} from "@/server/actions/admin/offer.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import { slugify } from "@/lib/utils";
import { decimalToPublicString } from "@/lib/validation/decimal-price";
import type { LimitedOffer, OfferPackage, Package } from "@/generated/prisma";

type OfferWithPackages = LimitedOffer & {
  offerPackages: Array<
    OfferPackage & { package: Pick<Package, "id" | "name" | "originalPrice"> }
  >;
};

type AvailablePackage = {
  id: string;
  name: string;
  originalPrice: { toString(): string } | string | number | null;
};

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Separate named component so `useFieldArray` is called from a proper React component, not an inline render-prop callback. */
function OfferFormFields({
  form: formProp,
  offer,
  availablePackages,
}: {
  form: unknown;
  offer?: OfferWithPackages;
  availablePackages: AvailablePackage[];
}) {
  const form = formProp as UseFormReturn<OfferFormInput>;
  const { register, formState, watch, setValue, getValues, control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });
  const name = watch("name");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم العرض (داخلي)" error={formState.errors.name?.message}>
          <input
            className="admin-input"
            {...register("name")}
            onBlur={event => {
              register("name").onBlur(event);
              if (!offer && !getValues("slug")) {
                setValue("slug", slugify(name || event.target.value));
              }
            }}
          />
        </Field>
        <Field label="الرابط (slug)" error={formState.errors.slug?.message}>
          <input className="admin-input" dir="ltr" {...register("slug")} />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="العنوان الرئيسي (يظهر للعميل)"
            error={formState.errors.headline?.message}
          >
            <input className="admin-input" {...register("headline")} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="الوصف (اختياري)"
            error={formState.errors.description?.message}
          >
            <textarea
              className="admin-input min-h-20"
              {...register("description")}
            />
          </Field>
        </div>
        <Field
          label="تاريخ ووقت البداية"
          error={formState.errors.startsAt?.message}
        >
          <input
            type="datetime-local"
            className="admin-input"
            dir="ltr"
            {...register("startsAt")}
          />
        </Field>
        <Field
          label="تاريخ ووقت النهاية"
          error={formState.errors.endsAt?.message}
        >
          <input
            type="datetime-local"
            className="admin-input"
            dir="ltr"
            {...register("endsAt")}
          />
        </Field>
        <Field
          label="أقصى عدد مقاعد (اختياري)"
          error={formState.errors.maxSlots?.message}
        >
          <input
            type="number"
            className="admin-input"
            {...register("maxSlots")}
          />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground">
          <input type="checkbox" {...register("isActive")} />
          فعّال (isActive)
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            الباقات المشمولة بالعرض
          </h3>
          <button
            type="button"
            onClick={() =>
              append({
                packageId: availablePackages[0]?.id ?? "",
                offerPrice: "",
                displayOrder: fields.length,
              })
            }
            disabled={availablePackages.length === 0}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة باقة
          </button>
        </div>
        {fields.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-3 text-xs text-foreground-muted">
            أضف باقة واحدة على الأقل بسعر عرض أقل من السعر الأصلي لتفعيل العرض.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => {
              const selectedId = watch(`packages.${index}.packageId`);
              const selectedPkg = availablePackages.find(
                p => p.id === selectedId
              );
              return (
                <div
                  key={field.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2"
                >
                  <select
                    className="admin-input flex-[2] min-w-40"
                    {...register(`packages.${index}.packageId` as const)}
                  >
                    {availablePackages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="admin-input flex-1 min-w-32"
                    dir="ltr"
                    placeholder="سعر العرض"
                    inputMode="decimal"
                    {...register(`packages.${index}.offerPrice` as const)}
                  />
                  <span className="text-xs text-foreground-muted" dir="ltr">
                    {selectedPkg?.originalPrice
                      ? `السعر الأصلي: ${decimalToPublicString(selectedPkg.originalPrice) ?? "—"}`
                      : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                    aria-label="إزالة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function OfferForm({
  offer,
  availablePackages,
  onDone,
}: {
  offer?: OfferWithPackages;
  availablePackages: AvailablePackage[];
  onDone: () => void;
}) {
  const router = useRouter();

  const defaultValues: OfferFormInput = {
    slug: offer?.slug ?? "",
    name: offer?.name ?? "",
    headline: offer?.headline ?? "",
    description: offer?.description ?? "",
    startsAt: offer ? toLocalInputValue(offer.startsAt) : "",
    endsAt: offer ? toLocalInputValue(offer.endsAt) : "",
    maxSlots: offer?.maxSlots ?? null,
    isActive: offer?.isActive ?? false,
    packages:
      offer?.offerPackages.map(op => ({
        packageId: op.packageId,
        offerPrice: op.offerPrice.toString(),
        displayOrder: op.displayOrder,
      })) ?? [],
  };

  return (
    <AdminEntityForm
      schema={offerInputSchema}
      defaultValues={defaultValues}
      action={input =>
        offer ? updateOfferAction(offer.id, input) : createOfferAction(input)
      }
      onSuccess={() => {
        onDone();
        router.refresh();
      }}
    >
      {form => (
        <OfferFormFields
          form={form as UseFormReturn<OfferFormInput>}
          offer={offer}
          availablePackages={availablePackages}
        />
      )}
    </AdminEntityForm>
  );
}
