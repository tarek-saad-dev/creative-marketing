"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { submitLeadAction } from "@/server/actions/submit-lead.action";
import {
  recordLeadStepAction,
  recordWhatsAppOpenedAction,
} from "@/server/actions/lead-session.action";
import { BrandButton } from "@/components/ui/brand-button";
import { IconButton } from "@/components/ui/icon-button";
import type {
  LeadFunnelPackageOption,
  LeadFunnelServiceOption,
} from "@/components/lead/lead-funnel-provider";

const formSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب"),
  phone: z
    .string()
    .trim()
    .min(8, "رقم الجوال مطلوب")
    .regex(/^[0-9+\s()-]+$/, "رقم الجوال غير صالح"),
  projectName: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  projectStage: z.string().trim().optional(),
  requestedServices: z.array(z.string()).optional(),
  packageId: z.string().nullable().optional(),
  isCustomPackage: z.boolean().optional(),
  budgetRange: z.string().trim().optional(),
  message: z.string().trim().optional(),
  preferredContactMethod: z.string().trim().optional(),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  "التواصل",
  "المشروع",
  "الاحتياج",
  "الميزانية",
  "المراجعة",
] as const;

type LeadDialogProps = {
  sessionId: string | null;
  selectedPackageId: string | null;
  isCustom: boolean;
  source: string;
  formOpenedAt: number;
  packages: LeadFunnelPackageOption[];
  services: LeadFunnelServiceOption[];
  hasWhatsApp: boolean;
  stepIndex: number;
  setStepIndex: (index: number) => void;
  onClose: () => void;
};

export function LeadDialog({
  sessionId,
  selectedPackageId,
  isCustom,
  source,
  formOpenedAt,
  packages,
  services,
  hasWhatsApp,
  stepIndex,
  setStepIndex,
  onClose,
}: LeadDialogProps) {
  const titleId = useId();
  const successRef = useRef<HTMLHeadingElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    url: string | null;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      projectName: "",
      industry: "",
      projectStage: "",
      requestedServices: [],
      packageId: selectedPackageId,
      isCustomPackage: isCustom,
      budgetRange: "",
      message: "",
      preferredContactMethod: "whatsapp",
      website: "",
    },
  });

  const {
    control,
    setValue,
    getValues,
    register,
    trigger,
    handleSubmit,
    formState,
  } = form;

  useEffect(() => {
    setValue("packageId", selectedPackageId);
    setValue("isCustomPackage", isCustom);
  }, [selectedPackageId, isCustom, setValue]);

  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);

  const values = useWatch({ control });

  async function goNext() {
    const fieldsByStep: Array<(keyof FormValues)[]> = [
      ["name", "phone"],
      ["industry", "projectStage"],
      ["requestedServices", "packageId"],
      ["budgetRange", "message"],
      [],
    ];
    const ok = await trigger(fieldsByStep[stepIndex] ?? []);
    if (!ok) return;

    if (sessionId) {
      await recordLeadStepAction({
        sessionId,
        step: `step_${stepIndex + 1}`,
      });
    }
    setStepIndex(Math.min(stepIndex + 1, STEPS.length - 1));
  }

  async function onSubmit(values: FormValues) {
    if (!sessionId) {
      setError("الجلسة غير جاهزة. أعد فتح النموذج.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const requestedService =
      values.requestedServices && values.requestedServices.length > 0
        ? values.requestedServices.join("، ")
        : undefined;

    const result = await submitLeadAction(
      {
        name: values.name,
        phone: values.phone,
        projectName: values.projectName,
        industry: values.industry,
        projectStage: values.projectStage,
        requestedService,
        packageId: values.isCustomPackage ? null : values.packageId,
        isCustomPackage: values.isCustomPackage,
        budgetRange: values.budgetRange,
        message: values.message,
        preferredContactMethod: values.preferredContactMethod,
        source,
        website: values.website ?? "",
        formOpenedAt,
        landingUrl:
          typeof window !== "undefined" ? window.location.href : undefined,
        referrer:
          typeof document !== "undefined" ? document.referrer : undefined,
      },
      { sessionId }
    );

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess({
      message: result.whatsappMessage,
      url: result.whatsappUrl,
    });

    if (result.whatsappUrl) {
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      await recordWhatsAppOpenedAction({ sessionId, via: "auto" });
    }
  }

  async function copyMessage() {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.message);
    } catch {
      /* ignore */
    }
  }

  async function retryWhatsApp() {
    if (!success?.url || !sessionId) return;
    window.open(success.url, "_blank", "noopener,noreferrer");
    await recordWhatsAppOpenedAction({ sessionId, via: "retry" });
  }

  return (
    <Dialog open onClose={onClose} className="relative z-toast">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <DialogPanel className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border/40 bg-background shadow-floating sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
            <DialogTitle
              id={titleId}
              className="font-headline text-lg font-semibold text-foreground"
            >
              {success ? "تم حفظ طلبك" : "ابدأ مشروعك"}
            </DialogTitle>
            <IconButton label="إغلاق" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>

          {!success ? (
            <div className="border-b border-border/20 px-4 py-2">
              <ol className="flex gap-1" aria-label="خطوات النموذج">
                {STEPS.map((label, index) => (
                  <li
                    key={label}
                    className={`flex-1 rounded-full px-1 py-1 text-center text-[10px] ${
                      index === stepIndex
                        ? "bg-primary text-primary-foreground"
                        : index < stepIndex
                          ? "bg-brand-aqua/30 text-foreground"
                          : "bg-white/5 text-foreground-muted"
                    }`}
                    aria-current={index === stepIndex ? "step" : undefined}
                  >
                    {label}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {success ? (
              <div className="space-y-4">
                <h3
                  ref={successRef}
                  tabIndex={-1}
                  className="font-headline text-xl font-semibold text-foreground outline-none"
                >
                  تم حفظ تفاصيل مشروعك بنجاح.
                </h3>
                <p className="text-sm leading-7 text-foreground-muted">
                  {hasWhatsApp
                    ? "يمكنك فتح واتساب الآن أو نسخ الرسالة إن لم يفتح المتصفح النافذة."
                    : "رقم واتساب غير مُعد حاليًا. انسخ الرسالة وتواصل عبر القناة المتاحة لاحقًا — طلبك محفوظ."}
                </p>
                <pre className="max-h-48 overflow-auto rounded-xl border border-border/40 bg-surface-glass p-3 text-xs leading-6 text-foreground whitespace-pre-wrap">
                  {success.message}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <BrandButton type="button" onClick={copyMessage}>
                    نسخ الرسالة
                  </BrandButton>
                  {success.url ? (
                    <BrandButton
                      type="button"
                      variant="secondary"
                      onClick={retryWhatsApp}
                    >
                      فتح واتساب
                    </BrandButton>
                  ) : null}
                  <BrandButton type="button" variant="ghost" onClick={onClose}>
                    إغلاق
                  </BrandButton>
                </div>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  {...register("website")}
                />

                {stepIndex === 0 ? (
                  <div className="space-y-3">
                    <Field label="الاسم" error={formState.errors.name?.message}>
                      <input
                        className="min-h-11 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("name")}
                        autoComplete="name"
                      />
                    </Field>
                    <Field
                      label="الجوال"
                      error={formState.errors.phone?.message}
                    >
                      <input
                        className="min-h-11 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("phone")}
                        autoComplete="tel"
                        inputMode="tel"
                      />
                    </Field>
                    <Field label="اسم المشروع (اختياري)">
                      <input
                        className="min-h-11 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("projectName")}
                      />
                    </Field>
                  </div>
                ) : null}

                {stepIndex === 1 ? (
                  <div className="space-y-3">
                    <Field label="مجال النشاط">
                      <input
                        className="min-h-11 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("industry")}
                      />
                    </Field>
                    <Field label="مرحلة المشروع">
                      <select
                        className="min-h-11 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("projectStage")}
                      >
                        <option value="">اختر</option>
                        <option value="جديد">جديد</option>
                        <option value="قائم">قائم</option>
                        <option value="إعادة تطوير">إعادة تطوير</option>
                      </select>
                    </Field>
                  </div>
                ) : null}

                {stepIndex === 2 ? (
                  <div className="space-y-3">
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-foreground">
                        الخدمات المطلوبة
                      </legend>
                      <div className="space-y-2">
                        {services.map(service => {
                          const selected =
                            values.requestedServices?.includes(
                              service.nameAr
                            ) ?? false;
                          return (
                            <label
                              key={service.id}
                              className="flex min-h-11 items-center gap-2 text-sm text-foreground"
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={event => {
                                  const current =
                                    getValues("requestedServices") ?? [];
                                  setValue(
                                    "requestedServices",
                                    event.target.checked
                                      ? [...current, service.nameAr]
                                      : current.filter(
                                          item => item !== service.nameAr
                                        )
                                  );
                                }}
                              />
                              {service.nameAr}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    <Field label="الباكدج">
                      <select
                        className="min-h-11 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={
                          values.isCustomPackage
                            ? "custom"
                            : (values.packageId ?? "")
                        }
                        onChange={event => {
                          if (event.target.value === "custom") {
                            setValue("isCustomPackage", true);
                            setValue("packageId", null);
                          } else {
                            setValue("isCustomPackage", false);
                            setValue("packageId", event.target.value || null);
                          }
                        }}
                      >
                        <option value="">بدون تحديد</option>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </option>
                        ))}
                        <option value="custom">عرض مخصص</option>
                      </select>
                    </Field>
                  </div>
                ) : null}

                {stepIndex === 3 ? (
                  <div className="space-y-3">
                    <Field label="الميزانية التقريبية">
                      <select
                        className="min-h-11 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("budgetRange")}
                      >
                        <option value="">اختر نطاقًا</option>
                        <option value="أقل من 3,000">أقل من 3,000</option>
                        <option value="3,000 – 7,000">3,000 – 7,000</option>
                        <option value="7,000 – 15,000">7,000 – 15,000</option>
                        <option value="أكثر من 15,000">أكثر من 15,000</option>
                      </select>
                    </Field>
                    <Field label="الهدف أو الرسالة">
                      <textarea
                        className="min-h-24 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("message")}
                      />
                    </Field>
                    <Field label="طريقة التواصل المفضلة">
                      <select
                        className="min-h-11 w-full rounded-xl border border-border/70 bg-surface-glass px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...register("preferredContactMethod")}
                      >
                        <option value="whatsapp">واتساب</option>
                        <option value="phone">اتصال</option>
                      </select>
                    </Field>
                  </div>
                ) : null}

                {stepIndex === 4 ? (
                  <div className="space-y-2 rounded-xl border border-border/40 bg-surface-glass p-4 text-sm text-foreground">
                    <p>
                      <strong>الاسم:</strong> {values.name}
                    </p>
                    <p>
                      <strong>الجوال:</strong> {values.phone}
                    </p>
                    {values.projectName ? (
                      <p>
                        <strong>المشروع:</strong> {values.projectName}
                      </p>
                    ) : null}
                    {values.industry ? (
                      <p>
                        <strong>المجال:</strong> {values.industry}
                      </p>
                    ) : null}
                    {values.projectStage ? (
                      <p>
                        <strong>المرحلة:</strong> {values.projectStage}
                      </p>
                    ) : null}
                    {values.requestedServices?.length ? (
                      <p>
                        <strong>الخدمات:</strong>{" "}
                        {values.requestedServices.join("، ")}
                      </p>
                    ) : null}
                    <p>
                      <strong>الباكدج:</strong>{" "}
                      {values.isCustomPackage
                        ? "عرض مخصص"
                        : packages.find(pkg => pkg.id === values.packageId)
                            ?.name || "غير محدد"}
                    </p>
                    {values.budgetRange ? (
                      <p>
                        <strong>الميزانية:</strong> {values.budgetRange}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-2">
                  {stepIndex > 0 ? (
                    <BrandButton
                      type="button"
                      variant="ghost"
                      onClick={() => setStepIndex(stepIndex - 1)}
                    >
                      رجوع
                    </BrandButton>
                  ) : null}
                  {stepIndex < STEPS.length - 1 ? (
                    <BrandButton type="button" onClick={goNext}>
                      التالي
                    </BrandButton>
                  ) : (
                    <BrandButton type="submit" disabled={submitting}>
                      {submitting ? "جارٍ الإرسال…" : "إرسال والانتقال لواتساب"}
                    </BrandButton>
                  )}
                </div>
              </form>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-destructive" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
