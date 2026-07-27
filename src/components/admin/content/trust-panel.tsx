import Link from "next/link";
import { ToneBadge } from "@/components/admin/status-badge";
import { listAdminTrustMetrics } from "@/server/services/admin/trust.admin.service";
import {
  CreateTrustMetricDialog,
  EditTrustMetricDialog,
} from "@/components/admin/trust/trust-form-dialogs";
import { ViewerReadonlyBanner } from "@/components/admin/content/content-helpers";

export async function TrustPanel({ canEdit }: { canEdit: boolean }) {
  const metrics = await listAdminTrustMetrics();

  return (
    <div className="space-y-4">
      <ViewerReadonlyBanner canEdit={canEdit} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-foreground">
            أرقام الثقة
          </h2>
          <p className="text-sm text-foreground-muted">
            لن يظهر الرقم على الموقع إلا بعد تفعيله وتأكيده.
          </p>
        </div>
        {canEdit ? <CreateTrustMetricDialog /> : null}
      </div>

      <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground-muted">
        لن يظهر الرقم على الموقع إلا بعد تفعيله وتأكيده.
      </div>

      {metrics.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-foreground-muted">
          لا توجد أرقام ثقة بعد — أضفها يدويًا عند جاهزيتها.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(metric => {
            const publicReady = metric.isActive && metric.isVerified;
            return (
              <article key={metric.id} className="admin-card space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">
                    {metric.label}
                  </h3>
                  <ToneBadge
                    label={publicReady ? "ظاهر للعامة" : "مخفي"}
                    tone={publicReady ? "success" : "neutral"}
                  />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {metric.prefix ?? ""}
                  {metric.value}
                  {metric.suffix ?? ""}
                </p>
                <p className="text-xs text-foreground-muted">
                  {metric.isVerified ? "موثّق" : "غير موثّق"} ·{" "}
                  {metric.isActive ? "مفعّل" : "غير مفعّل"}
                </p>
                {canEdit ? <EditTrustMetricDialog metric={metric} /> : null}
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs text-foreground-muted">
        الصفحة المتقدمة:{" "}
        <Link href="/admin/trust" className="text-primary hover:underline">
          إدارة مؤشرات الثقة
        </Link>
      </p>
    </div>
  );
}
