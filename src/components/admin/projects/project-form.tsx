"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  projectInputSchema,
  type ProjectFormInput,
} from "@/lib/validation/admin/project";
import {
  createProjectAction,
  updateProjectAction,
} from "@/server/actions/admin/project.action";
import { AdminEntityForm } from "@/components/admin/admin-entity-form";
import { Field } from "@/components/admin/field";
import { slugify } from "@/lib/utils";
import type { AdminProjectDetail } from "@/server/repositories/admin/project.admin.repository";

const STEPS = [
  { id: 1, label: "البيانات الأساسية" },
  { id: 2, label: "تفاصيل المشروع" },
  { id: 3, label: "الصور" },
  { id: 4, label: "الخدمات" },
  { id: 5, label: "الحفظ" },
] as const;

function PublishChecklist({
  values,
}: {
  values: {
    title?: string;
    industry?: string;
    summary?: string;
    coverImageUrl?: string;
    coverImageAlt?: string;
  };
}) {
  const items = [
    { label: "الاسم", ok: Boolean(values.title?.trim()) },
    { label: "المجال", ok: Boolean(values.industry?.trim()) },
    { label: "الوصف", ok: Boolean(values.summary?.trim()) },
    { label: "صورة الغلاف", ok: Boolean(values.coverImageUrl?.trim()) },
    { label: "وصف الصورة", ok: Boolean(values.coverImageAlt?.trim()) },
  ];
  const ready = items.every(i => i.ok);

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="mb-2 text-sm font-semibold text-foreground">
        {ready ? "جاهز للنشر" : "قبل النشر أكمل:"}
      </p>
      <ul className="space-y-1 text-sm">
        {items.map(item => (
          <li
            key={item.label}
            className={item.ok ? "text-emerald-700" : "text-foreground-muted"}
          >
            {item.ok ? "✓" : "○"} {item.label}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-foreground-muted">
        بعد الحفظ يمكنك إضافة المزيد من الصور/الفيديو من صفحة المشروع، ثم النشر
        من أزرار الحالة.
      </p>
    </div>
  );
}

export function ProjectForm({
  project,
  services,
}: {
  project?: AdminProjectDetail;
  services: Array<{ id: string; nameAr: string }>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const defaultValues: ProjectFormInput = {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    clientName: project?.clientName ?? "",
    industry: project?.industry ?? "",
    summary: project?.summary ?? "",
    challenge: project?.challenge ?? "",
    solution: project?.solution ?? "",
    duration: project?.duration ?? "",
    resultText: project?.resultText ?? "",
    coverImageUrl: project?.coverImageUrl ?? "",
    coverImageAlt: project?.coverImageAlt ?? "",
    featured: project?.featured ?? false,
    displayOrder: project?.displayOrder ?? 0,
    serviceIds: project?.projectServices.map(ps => ps.serviceId) ?? [],
  };

  return (
    <AdminEntityForm
      schema={projectInputSchema}
      defaultValues={defaultValues}
      action={input =>
        project
          ? updateProjectAction(project.id, input)
          : createProjectAction(input)
      }
      onSuccess={result => {
        router.refresh();
        if (
          !project &&
          result &&
          typeof result === "object" &&
          "id" in result
        ) {
          router.push(`/admin/projects/${(result as { id: string }).id}`);
        }
      }}
      submitLabel={project ? "حفظ التعديلات" : "حفظ كمسودة"}
    >
      {form => {
        const { register, formState, watch, setValue, getValues } = form;
        const title = watch("title");
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1">
              {STEPS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={
                    step === item.id
                      ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      : "rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-muted"
                  }
                >
                  {item.id}. {item.label}
                </button>
              ))}
            </div>

            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="اسم المشروع"
                  error={formState.errors.title?.message}
                  required
                >
                  <input
                    className="admin-input"
                    {...register("title")}
                    onBlur={event => {
                      register("title").onBlur(event);
                      if (!project && !getValues("slug")) {
                        setValue("slug", slugify(title || event.target.value));
                      }
                    }}
                  />
                </Field>
                <Field
                  label="اسم العميل (اختياري)"
                  error={formState.errors.clientName?.message}
                >
                  <input className="admin-input" {...register("clientName")} />
                </Field>
                <Field
                  label="المجال"
                  error={formState.errors.industry?.message}
                  required
                >
                  <input className="admin-input" {...register("industry")} />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="وصف مختصر"
                    error={formState.errors.summary?.message}
                  >
                    <textarea
                      className="admin-input min-h-20"
                      {...register("summary")}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <details className="rounded-md border border-border p-3">
                    <summary className="cursor-pointer text-sm font-medium text-foreground-muted">
                      إعدادات متقدمة (الرابط التلقائي)
                    </summary>
                    <div className="mt-3">
                      <Field
                        label="رابط المشروع"
                        error={formState.errors.slug?.message}
                        hint="يُنشأ تلقائيًا من الاسم — عدّله فقط عند الحاجة"
                      >
                        <input
                          className="admin-input"
                          dir="ltr"
                          {...register("slug")}
                        />
                      </Field>
                    </div>
                  </details>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="التحدي"
                  error={formState.errors.challenge?.message}
                >
                  <textarea
                    className="admin-input min-h-24"
                    {...register("challenge")}
                  />
                </Field>
                <Field label="الحل" error={formState.errors.solution?.message}>
                  <textarea
                    className="admin-input min-h-24"
                    {...register("solution")}
                  />
                </Field>
                <Field
                  label="النتيجة"
                  error={formState.errors.resultText?.message}
                >
                  <input className="admin-input" {...register("resultText")} />
                </Field>
                <Field label="المدة" error={formState.errors.duration?.message}>
                  <input className="admin-input" {...register("duration")} />
                </Field>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <p className="sm:col-span-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground-muted">
                  أضف رابط الصورة. يمكنك استخدام روابط الصور الآن، وربط
                  Cloudinary لاحقًا. بعد الحفظ استخدم مدير الوسائط لإضافة
                  المزيد.
                </p>
                <Field
                  label="صورة الغلاف"
                  error={formState.errors.coverImageUrl?.message}
                >
                  <input
                    className="admin-input"
                    dir="ltr"
                    {...register("coverImageUrl")}
                    placeholder="https://..."
                  />
                </Field>
                <Field
                  label="وصف الصورة (Alt)"
                  error={formState.errors.coverImageAlt?.message}
                >
                  <input
                    className="admin-input"
                    {...register("coverImageAlt")}
                  />
                </Field>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <span className="admin-label">اختر الخدمات</span>
                <div className="mt-2 flex flex-wrap gap-3 rounded-md border border-border p-3">
                  {services.length === 0 ? (
                    <p className="text-xs text-foreground-muted">
                      لا توجد خدمات فعّالة بعد.
                    </p>
                  ) : (
                    services.map(service => (
                      <label
                        key={service.id}
                        className="flex items-center gap-1.5 text-sm text-foreground"
                      >
                        <input
                          type="checkbox"
                          value={service.id}
                          {...register("serviceIds")}
                        />
                        {service.nameAr}
                      </label>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-4">
                <PublishChecklist values={watch()} />
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <input type="checkbox" {...register("featured")} />
                    مشروع مميز
                  </label>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3">
              <button
                type="button"
                disabled={step <= 1}
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm disabled:opacity-40"
              >
                السابق
              </button>
              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => Math.min(5, s + 1))}
                  className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
                >
                  التالي
                </button>
              ) : (
                <p className="text-xs text-foreground-muted self-center">
                  استخدم زر الحفظ بالأسفل
                </p>
              )}
            </div>
          </div>
        );
      }}
    </AdminEntityForm>
  );
}
