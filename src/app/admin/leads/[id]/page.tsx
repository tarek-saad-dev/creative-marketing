import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import { getAdminLeadById } from "@/server/services/admin/lead.admin.service";
import { listAdminUsers } from "@/server/repositories/admin-user.repository";
import { LeadAssignSelect } from "@/components/admin/leads/lead-assign-select";
import { LeadStatusActions } from "@/components/admin/leads/lead-status-actions";
import {LeadCrmActions} from "@/components/admin/leads/lead-crm-actions";
import {latestLeadFollowups} from "@/server/repositories/admin/lead.admin.repository";
import {cairoToday,contactPhone,readCrmEvent,leadStageLabels} from "@/lib/admin/lead-crm";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "تفاصيل العميل المحتمل" };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const EVENT_LABELS: Record<string, string> = {
  STATUS_CHANGED: "تغيير الحالة",
  CONTACTED: "تم التواصل",
  QUALIFIED: "مؤهل",
  WON: "تم الفوز به",
  LOST: "خسارة",
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="text-foreground-muted">{label}</span>
      <span className="text-end font-medium text-foreground">{value}</span>
    </div>
  );
}

export default async function AdminLeadDetailPage({ params }: PageProps) {
  const user = await requireRole(AdminRole.VIEWER);
  const { id } = await params;
  const [lead, admins] = await Promise.all([
    getAdminLeadById(id),
    user.role==="ADMIN"||user.role==="OWNER"?listAdminUsers():Promise.resolve([]),
  ]);

  if (!lead) notFound();

  const canMutate =
    user.role === AdminRole.OWNER || user.role === AdminRole.ADMIN;

  const open=["NEW","CONTACTED","QUALIFIED"].includes(lead.status);
  const dueDate=(await latestLeadFollowups([id]))[0]?.dueDate??null;
  const phone=contactPhone(lead.phone);
  return (
    <div>
      <AdminPageHeader
        title={lead.name}
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "العملاء المحتملون", href: "/admin/leads" },
          { label: lead.name },
        ]}
        actions={<LeadStatusBadge status={lead.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="admin-card p-4 lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            بيانات التواصل
          </h2>
          <DetailRow label="الاسم" value={lead.name} />
          <DetailRow
            label="الهاتف"
            value={<span dir="ltr">{canMutate?lead.phone:lead.phone.replace(/.(?=.{4})/g,"•")}</span>}
          />
          {canMutate&&phone&&<div className="my-3 flex flex-wrap gap-2"><a href={"https://wa.me/"+phone} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white">فتح واتساب</a><a href={"tel:+"+phone} className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm">اتصال</a></div>}
          <DetailRow label="اسم المشروع" value={lead.projectName ?? "—"} />
          <DetailRow label="المجال" value={lead.industry ?? "—"} />
          <DetailRow label="مرحلة المشروع" value={lead.projectStage ?? "—"} />
          <DetailRow
            label="الخدمة المطلوبة"
            value={lead.requestedService ?? "—"}
          />
          <DetailRow label="الباقة" value={lead.package?.name ?? "—"} />
          <DetailRow label="نطاق الميزانية" value={lead.budgetRange ?? "—"} />
          <DetailRow
            label="طريقة التواصل المفضلة"
            value={lead.preferredContactMethod ?? "—"}
          />
          <DetailRow label="الرسالة" value={lead.message ?? "—"} />
          <DetailRow label="المصدر" value={lead.source ?? "—"} />
          <DetailRow label="الحملة" value={lead.utmCampaign??"—"}/><DetailRow label="UTM Source" value={lead.utmSource??"—"}/><DetailRow label="UTM Medium" value={lead.utmMedium??"—"}/>
          <DetailRow
            label="تاريخ الإنشاء"
            value={formatDateTime(lead.createdAt)}
          />

          <hr className="my-4 border-border" />

          {canMutate ? (
            <LeadStatusActions
              leadId={lead.id}
              status={lead.status}
              canCorrect={canMutate}
              internalNote={lead.internalNote}
            />
          ) : (
            <>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                ملاحظة داخلية
              </h2>
              <p className="text-sm text-foreground-muted">
                {lead.internalNote ?? "—"}
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          {canMutate?<LeadCrmActions leadId={id} dueDate={dueDate} today={cairoToday()} open={open}/>:<div className="admin-card p-4 text-sm">المتابعة القادمة: {dueDate??"غير محددة"}</div>}
          {canMutate ? (
            <div className="admin-card p-4">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                المسؤول
              </h2>
              <LeadAssignSelect
                leadId={lead.id}
                assignedAdminId={lead.assignedAdmin?.id ?? null}
                admins={admins
                  .filter(a => a.isActive&&["ADMIN","OWNER"].includes(a.role))
                  .map(a => ({ id: a.id, name: a.name }))}
              />
            </div>
          ) : null}

          <div className="admin-card p-4">
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              سجل الأحداث (آخر 100)
            </h2>
            {lead.events.length === 0 ? (
              <p className="text-xs text-foreground-muted">
                لا توجد أحداث بعد.
              </p>
            ) : (
              <ul className="space-y-2">
                {lead.events.map(event => {const crm=readCrmEvent(event.metadata);const transition=event.metadata&&typeof event.metadata==="object"&&!Array.isArray(event.metadata)?event.metadata as Record<string,unknown>:null;return (
                  <li key={event.id} className="text-xs">
                    <p className="font-medium text-foreground">
                      {crm?.kind==="followup"?(crm.dueDate?"متابعة مجدولة · "+crm.dueDate:"إنهاء المتابعة"):crm?.kind==="contact"?"تواصل مسجل · "+({whatsapp:"واتساب",phone:"مكالمة",meeting:"اجتماع",other:"أخرى"}[crm.channel]??crm.channel):EVENT_LABELS[event.type]??event.type}
                    </p>
                    <p className="text-foreground-muted">
                      {formatDateTime(event.createdAt)}{crm?.actor?" · "+crm.actor:""}
                    </p>
                    {crm?.kind==="contact"&&<p className="mt-1 whitespace-pre-wrap break-words text-sm">{crm.note}</p>}{!crm&&typeof transition?.from==="string"&&typeof transition?.to==="string"&&<p className="mt-1 text-foreground-muted">{leadStageLabels[transition.from as keyof typeof leadStageLabels]??transition.from} ← {leadStageLabels[transition.to as keyof typeof leadStageLabels]??transition.to}</p>}
                  </li>
                );})}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
