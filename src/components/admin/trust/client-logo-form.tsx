"use client";

import { useRouter } from "next/navigation";
import {
  clientLogoInputSchema,
  type ClientLogoFormInput,
} from "@/lib/validation/admin/trust";
import {
  createClientLogoAction,
  updateClientLogoAction,
} from "@/server/actions/admin/trust.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import type { ClientLogo } from "@/generated/prisma";

export function ClientLogoForm({
  logo,
  onDone,
}: {
  logo?: ClientLogo;
  onDone: () => void;
}) {
  const router = useRouter();

  const defaultValues: ClientLogoFormInput = {
    name: logo?.name ?? "",
    logoUrl: logo?.logoUrl ?? "",
    websiteUrl: logo?.websiteUrl ?? "",
    isActive: logo?.isActive ?? false,
    displayOrder: logo?.displayOrder ?? 0,
  };

  return (
    <AdminEntityForm
      schema={clientLogoInputSchema}
      defaultValues={defaultValues}
      action={input =>
        logo
          ? updateClientLogoAction(logo.id, input)
          : createClientLogoAction(input)
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
            <Field label="اسم العميل" error={formState.errors.name?.message}>
              <input className="admin-input" {...register("name")} />
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
              label="رابط الشعار"
              error={formState.errors.logoUrl?.message}
            >
              <input
                className="admin-input"
                dir="ltr"
                {...register("logoUrl")}
              />
            </Field>
            <Field
              label="رابط الموقع (اختياري)"
              error={formState.errors.websiteUrl?.message}
            >
              <input
                className="admin-input"
                dir="ltr"
                {...register("websiteUrl")}
              />
            </Field>
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
