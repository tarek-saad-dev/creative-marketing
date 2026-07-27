"use client";

import { useRouter } from "next/navigation";
import {
  siteSettingInputSchema,
  type SiteSettingFormInput,
} from "@/lib/validation/admin/settings";
import { upsertSiteSettingAction } from "@/server/actions/admin/settings.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import type { SiteSetting } from "@/generated/prisma";

function valueToRawString(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function SettingForm({
  setting,
  onDone,
}: {
  setting?: SiteSetting;
  onDone: () => void;
}) {
  const router = useRouter();

  const defaultValues: SiteSettingFormInput = {
    key: setting?.key ?? "",
    value: setting ? valueToRawString(setting.value) : "",
    description: setting?.description ?? "",
  };

  return (
    <AdminEntityForm
      schema={siteSettingInputSchema}
      defaultValues={defaultValues}
      action={input => upsertSiteSettingAction(input)}
      onSuccess={() => {
        onDone();
        router.refresh();
      }}
    >
      {form => {
        const { register, formState } = form;
        return (
          <div className="space-y-4">
            <Field
              label="المفتاح"
              error={formState.errors.key?.message}
              hint="مثال: brand.whatsapp — لا يمكن تغييره بعد الإنشاء (احذف وأنشئ مفتاحًا جديدًا بدلًا من ذلك)"
            >
              <input
                className="admin-input"
                dir="ltr"
                readOnly={Boolean(setting)}
                {...register("key")}
              />
            </Field>
            <Field
              label="القيمة"
              error={formState.errors.value?.message}
              hint='نص عادي أو JSON صالح (مثال: "text" أو ["a","b"] أو {"a":1})'
            >
              <textarea
                className="admin-input min-h-24"
                dir="ltr"
                {...register("value")}
              />
            </Field>
            <Field
              label="وصف (اختياري)"
              error={formState.errors.description?.message}
            >
              <input className="admin-input" {...register("description")} />
            </Field>
          </div>
        );
      }}
    </AdminEntityForm>
  );
}
