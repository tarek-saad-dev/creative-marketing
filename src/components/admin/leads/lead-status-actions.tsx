"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LeadStatus } from "@/generated/prisma";
import {
  updateLeadInternalNoteAction,
  updateLeadStatusAction,
} from "@/server/actions/admin/lead.action";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";

const LABELS: Record<LeadStatus, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  QUALIFIED: "مؤهل",
  WON: "مكتسب",
  LOST: "خاسر",
  ARCHIVED: "مؤرشف",
};

const NEXT: Record<LeadStatus, LeadStatus[]> = {
  NEW: [LeadStatus.CONTACTED, LeadStatus.ARCHIVED],
  CONTACTED: [LeadStatus.QUALIFIED, LeadStatus.ARCHIVED],
  QUALIFIED: [LeadStatus.WON, LeadStatus.LOST, LeadStatus.ARCHIVED],
  WON: [LeadStatus.ARCHIVED],
  LOST: [LeadStatus.ARCHIVED],
  ARCHIVED: [],
};

export function LeadStatusActions({
  leadId,
  status,
  canCorrect,
  internalNote,
}: {
  leadId: string;
  status: LeadStatus;
  canCorrect: boolean;
  internalNote: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState(internalNote ?? "");

  function changeStatus(toStatus: LeadStatus, correction = false) {
    setError(null);
    startTransition(async () => {
      const result = await updateLeadStatusAction(leadId, {
        status: toStatus,
        confirmCorrection: correction,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">تغيير الحالة</h2>
        <p className="text-sm text-foreground-muted">
          الحالية: {LABELS[status]} ({status})
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {NEXT[status].map(next => (
            <button
              key={next}
              type="button"
              disabled={pending}
              onClick={() => changeStatus(next)}
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              → {LABELS[next]}
            </button>
          ))}
        </div>
      </div>

      {canCorrect ? (
        <div>
          <h3 className="text-sm font-semibold">تصحيح الحالة (OWNER/ADMIN)</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.values(LeadStatus)
              .filter(s => s !== status)
              .map(s => (
                <ConfirmActionDialog
                  key={s}
                  title="تصحيح حالة الطلب"
                  description={`تأكيد التصحيح إلى ${LABELS[s]}؟ سيُسجَّل هذا الإجراء في سجل التدقيق.`}
                  confirmLabel="تأكيد التصحيح"
                  onConfirm={() => changeStatus(s, true)}
                  trigger={
                    <span
                      className={`inline-flex h-9 items-center rounded-md border border-border px-3 text-xs ${
                        pending ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {LABELS[s]}
                    </span>
                  }
                />
              ))}
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor="lead-note" className="text-sm font-semibold">
          ملاحظة داخلية
        </label>
        <textarea
          id="lead-note"
          className="admin-input mt-1 min-h-24"
          value={note}
          onChange={event => setNote(event.target.value)}
        />
        <button
          type="button"
          disabled={pending}
          className="mt-2 inline-flex h-9 items-center rounded-md border border-border px-3 text-sm"
          onClick={() => {
            startTransition(async () => {
              const result = await updateLeadInternalNoteAction(leadId, {
                internalNote: note,
              });
              if (!result.ok) setError(result.error);
              else router.refresh();
            });
          }}
        >
          حفظ الملاحظة
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
