"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  structuredSiteSettingsSchema,
  type StructuredSiteSettingsInput,
} from "@/lib/validation/admin/structured-settings";
import { saveStructuredSiteSettingsAction } from "@/server/actions/admin/settings.action";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-foreground-muted">
          {hint}
        </span>
      ) : null}
      <div className="mt-1">{children}</div>
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function StructuredSettingsForm({
  initial,
}: {
  initial: StructuredSiteSettingsInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<StructuredSiteSettingsInput>({
    resolver: zodResolver(structuredSiteSettingsSchema),
    defaultValues: initial,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  return (
    <form
      className="space-y-8"
      onSubmit={handleSubmit(values => {
        setFormError(null);
        setSuccess(null);
        startTransition(async () => {
          const result = await saveStructuredSiteSettingsAction(values);
          if (!result.ok) {
            setFormError(result.error);
            return;
          }
          const count = result.data.changedKeys.length;
          setSuccess(
            count === 0
              ? "لا تغييرات للحفظ."
              : `تم حفظ ${count} إعدادًا وإعادة التحقق من الصفحات ذات الصلة.`
          );
          reset(values);
          router.refresh();
        });
      })}
    >
      <UnsavedChangesGuard dirty={isDirty && !pending} />
      <section className="admin-card space-y-4 p-4">
        <h2 className="text-lg font-semibold">بيانات البراند</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم العلامة" error={errors.brandName?.message}>
            <input className="admin-input" {...register("brandName")} />
          </Field>
          <Field label="الشعار" error={errors.slogan?.message}>
            <input className="admin-input" {...register("slogan")} />
          </Field>
          <Field label="الوصف بالعربية" error={errors.descriptionAr?.message}>
            <textarea
              className="admin-input min-h-24"
              {...register("descriptionAr")}
            />
          </Field>
          <Field
            label="الوصف بالإنجليزية"
            error={errors.descriptionEn?.message}
          >
            <textarea
              className="admin-input min-h-24"
              dir="ltr"
              {...register("descriptionEn")}
            />
          </Field>
        </div>
      </section>

      <section className="admin-card space-y-4 p-4">
        <h2 className="text-lg font-semibold">التواصل</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="واتساب"
            hint="أرقام فقط أو + — بدون تخمين رمز الدولة"
            error={errors.whatsapp?.message}
          >
            <input
              className="admin-input"
              dir="ltr"
              {...register("whatsapp")}
            />
          </Field>
          <Field label="البريد" error={errors.email?.message}>
            <input className="admin-input" dir="ltr" {...register("email")} />
          </Field>
          <Field label="ساعات الرد" error={errors.responseHours?.message}>
            <input className="admin-input" {...register("responseHours")} />
          </Field>
          <Field
            label="رسالة التواصل المفضلة"
            error={errors.preferredContactMessage?.message}
          >
            <input
              className="admin-input"
              {...register("preferredContactMessage")}
            />
          </Field>
        </div>
      </section>

      <section className="admin-card space-y-4 p-4">
        <h2 className="text-lg font-semibold">السوشيال</h2>
        <p className="text-xs text-foreground-muted">
          الروابط الفارغة تبقى مخفية في الواجهة العامة.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["instagram", "Instagram"],
              ["facebook", "Facebook"],
              ["behance", "Behance"],
              ["linkedin", "LinkedIn"],
            ] as const
          ).map(([name, label]) => (
            <Field key={name} label={label} error={errors[name]?.message}>
              <input className="admin-input" dir="ltr" {...register(name)} />
            </Field>
          ))}
        </div>
      </section>

      <section className="admin-card space-y-4 p-4">
        <h2 className="text-lg font-semibold">Hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow / شارة" error={errors.heroEyebrow?.message}>
            <input className="admin-input" {...register("heroEyebrow")} />
          </Field>
          <Field label="العنوان بالعربية" error={errors.heroTitleAr?.message}>
            <input className="admin-input" {...register("heroTitleAr")} />
          </Field>
          <Field label="الوصف" error={errors.heroDescription?.message}>
            <textarea
              className="admin-input min-h-24 sm:col-span-2"
              {...register("heroDescription")}
            />
          </Field>
          <Field label="CTA أساسي" error={errors.heroPrimaryCta?.message}>
            <input className="admin-input" {...register("heroPrimaryCta")} />
          </Field>
          <Field label="CTA ثانوي" error={errors.heroSecondaryCta?.message}>
            <input className="admin-input" {...register("heroSecondaryCta")} />
          </Field>
          <Field
            label="نص مصغّر قياسي"
            hint="يُستخدم عند عدم وجود أسعار منشورة"
            error={errors.heroMicrocopy?.message}
          >
            <input className="admin-input" {...register("heroMicrocopy")} />
          </Field>
          <Field
            label="نص مصغّر مع أسعار"
            error={errors.heroPricingMicrocopy?.message}
          >
            <input
              className="admin-input"
              {...register("heroPricingMicrocopy")}
            />
          </Field>
        </div>
      </section>

      <section className="admin-card space-y-4 p-4">
        <h2 className="text-lg font-semibold">SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="عنوان الموقع" error={errors.seoSiteTitle?.message}>
            <input className="admin-input" {...register("seoSiteTitle")} />
          </Field>
          <Field
            label="وصف الميتا بالعربية"
            error={errors.seoMetaDescriptionAr?.message}
          >
            <textarea
              className="admin-input min-h-20"
              {...register("seoMetaDescriptionAr")}
            />
          </Field>
          <Field label="رابط الإنتاج" error={errors.seoSiteUrl?.message}>
            <input
              className="admin-input"
              dir="ltr"
              {...register("seoSiteUrl")}
            />
          </Field>
          <Field
            label="صورة OG الافتراضية"
            error={errors.seoOgImageUrl?.message}
          >
            <input
              className="admin-input"
              dir="ltr"
              {...register("seoOgImageUrl")}
            />
          </Field>
        </div>
      </section>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted"
        >
          معاينة الموقع
        </a>
        <button
          type="submit"
          disabled={pending || !isDirty}
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {pending ? "جاري الحفظ…" : "حفظ التعديلات"}
        </button>
        {!isDirty ? (
          <span className="text-xs text-foreground-muted">
            لا تغييرات غير محفوظة
          </span>
        ) : null}
      </div>
    </form>
  );
}
