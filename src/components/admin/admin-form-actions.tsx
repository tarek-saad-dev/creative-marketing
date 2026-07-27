"use client";

export function AdminFormActions({
  pending,
  submitLabel = "حفظ",
  onCancel,
  disabled,
}: {
  pending?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="submit"
        disabled={pending || disabled}
        className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "جاري الحفظ…" : submitLabel}
      </button>
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
        >
          إلغاء
        </button>
      ) : null}
    </div>
  );
}
