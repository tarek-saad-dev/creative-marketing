import Link from "next/link";
import { ToneBadge } from "@/components/admin/status-badge";
import { listAdminFaqs } from "@/server/services/admin/faq.admin.service";
import {
  CreateFaqDialog,
  EditFaqDialog,
} from "@/components/admin/faqs/faq-form-dialogs";
import { FaqMoveControls } from "@/components/admin/content/reorder-controls";
import { ViewerReadonlyBanner } from "@/components/admin/content/content-helpers";

export async function FaqsPanel({ canEdit }: { canEdit: boolean }) {
  const faqs = await listAdminFaqs();

  return (
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            الأسئلة الشائعة
          </h2>
          <p className="text-sm text-foreground-muted">
            أسئلة وأجوبة واضحة للزائر — بدون تفاصيل تقنية.
          </p>
        </div>
        {canEdit ? <CreateFaqDialog /> : null}
      </div>

      {faqs.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-foreground-muted">
          لا توجد أسئلة بعد.
        </div>
      ) : (
        <div className="space-y-2">
          {faqs.map(faq => (
            <details key={faq.id} className="admin-card group p-4">
              <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>{faq.question}</span>
                  <span className="flex items-center gap-2">
                    {faq.category ? (
                      <span className="text-xs font-normal text-foreground-muted">
                        {faq.category}
                      </span>
                    ) : null}
                    <ToneBadge
                      label={faq.isActive ? "ظاهر" : "مخفي"}
                      tone={faq.isActive ? "success" : "neutral"}
                    />
                  </span>
                </div>
              </summary>
              <div className="mt-3 space-y-3 border-t border-border pt-3">
                <p className="whitespace-pre-wrap text-sm text-foreground-muted">
                  {faq.answer}
                </p>
                {canEdit ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <FaqMoveControls id={faq.id} />
                    <EditFaqDialog faq={faq} />
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        الصفحة المتقدمة:{" "}
        <Link href="/admin/faqs" className="text-primary hover:underline">
          إدارة الأسئلة
        </Link>
      </p>
    </div>
  );
}
