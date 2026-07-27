"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { AdminMutationResult } from "@/server/auth/admin-mutation";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";

/**
 * Generic RHF + Zod + Server Action form used by admin entity editors.
 */
export function AdminEntityForm<
  TFieldValues extends FieldValues,
  TResult = unknown,
>({
  schema,
  defaultValues,
  action,
  onSuccess,
  children,
  submitLabel = "حفظ",
  submittingLabel = "جارٍ الحفظ…",
}: {
  schema: z.ZodType<TFieldValues, TFieldValues>;
  defaultValues: DefaultValues<TFieldValues>;
  action: (input: TFieldValues) => Promise<AdminMutationResult<TResult>>;
  onSuccess?: (result: TResult) => void;
  children: (form: UseFormReturn<TFieldValues>) => React.ReactNode;
  submitLabel?: string;
  submittingLabel?: string;
}) {
  const form = useForm<TFieldValues>({
    // Zod 4 + RHF resolver typing is intentionally loosened at the boundary.
    resolver: zodResolver(schema as never),
    defaultValues,
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const statusId = useId();

  useEffect(() => {
    if (serverError) {
      errorRef.current?.focus();
    }
  }, [serverError]);

  async function onSubmit(values: TFieldValues) {
    setSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);
    const result = await action(values);
    setSubmitting(false);

    if (!result.ok) {
      setServerError(result.error);
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          form.setError(key as never, { message: messages[0] });
        }
      }
      return;
    }

    form.reset(values);
    setSuccessMessage("تم الحفظ بنجاح");
    onSuccess?.(result.data);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
      aria-busy={submitting}
    >
      <UnsavedChangesGuard dirty={form.formState.isDirty && !submitting} />
      {children(form)}
      {serverError ? (
        <p
          ref={errorRef}
          tabIndex={-1}
          className="text-sm text-destructive outline-none"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}
      <p
        id={statusId}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {submitting ? submittingLabel : (successMessage ?? "")}
      </p>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          aria-describedby={statusId}
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
