"use client";

import {MediaPicker} from "@/components/admin/media/media-picker";
import {ResilientImage} from "@/components/ui/resilient-media";

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
import { projectPublishChecklist } from "@/lib/content/project-publishing";
import { slugify } from "@/lib/utils";
import type { AdminProjectDetail } from "@/server/repositories/admin/project.admin.repository";

function PublishChecklist({
  values,
}: {
  values: {
    title?: string;
    slug?: string;
    industry?: string;
    summary?: string;
    coverImageUrl?: string;
    coverImageAlt?: string;
  };
}) {
  const items = projectPublishChecklist(values);
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
            {Object.keys(formState.errors).length>0&&<div role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive"><p className="font-semibold">راجع الحقول قبل الحفظ</p>{Object.entries(formState.errors).map(([key,error])=><p key={key}>{error?.message?.toString()||"راجع "+key}</p>)}</div>}
            <p className="text-xs text-foreground-muted">غيّر البيانات الأساسية واحفظ مباشرة. باقي التفاصيل اختيارية.</p>
            {(
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
            )}

            <details className="rounded-lg border border-border p-3" open={Boolean(formState.errors.challenge||formState.errors.solution||formState.errors.duration||formState.errors.resultText)||undefined}><summary className="cursor-pointer text-sm font-semibold">تفاصيل المشروع (اختياري)</summary><div className="mt-3">{(
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
            )}</div></details>

            <details className="rounded-lg border border-border p-3" open={Boolean(formState.errors.coverImageUrl||formState.errors.coverImageAlt)||undefined}><summary className="cursor-pointer text-sm font-semibold">تعديل الغلاف يدويًا</summary><div className="mt-3">{(
              <div className="grid gap-4 sm:grid-cols-2">
                <p className="sm:col-span-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground-muted">
                  اختر الغلاف من مكتبة الوسائط أو استخدم رابط صورة. احفظ المشروع لتطبيق التغيير.
                </p>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3"><div className="relative h-32 w-40 overflow-hidden rounded-lg bg-[#252c69]"><ResilientImage src={watch("coverImageUrl")} alt={watch("coverImageAlt")||title||"الغلاف"} sizes="160px"/></div><MediaPicker imagesOnly disabled={formState.isSubmitting} onPick={item=>{setValue("coverImageUrl",item.url,{shouldDirty:true,shouldValidate:true});setValue("coverImageAlt",item.altText||title||item.name,{shouldDirty:true,shouldValidate:true});}}/></div>
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
            )}</div></details>

            <details className="rounded-lg border border-border p-3" open={Boolean(formState.errors.serviceIds)||undefined}><summary className="cursor-pointer text-sm font-semibold">الخدمات المرتبطة (اختياري)</summary><div className="mt-3">{(
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
            )}</div></details>

            <details className="rounded-lg border border-border p-3" open={Boolean(formState.errors.displayOrder||formState.errors.featured)||undefined}><summary className="cursor-pointer text-sm font-semibold">إعدادات العرض المتقدمة</summary><div className="mt-3">{(
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
            )}</div></details>

          </div>
        );
      }}
    </AdminEntityForm>
  );
}
