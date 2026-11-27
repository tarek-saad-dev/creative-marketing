import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatus, AdminRole } from "@/generated/prisma";
import { requireRole } from "@/server/auth/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import { listAdminLeads } from "@/server/services/admin/lead.admin.service";
import {getLeadCrmOverview,latestLeadFollowups} from "@/server/repositories/admin/lead.admin.repository";
import {leadStageLabels,followupState,closedLeadConversion,isDateOnly} from "@/lib/admin/lead-crm";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = { title: "العملاء المحتملون" };
export const dynamic = "force-dynamic";

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `${digits.slice(0, 3)}••••${digits.slice(-2)}`;
}

type Search = {
  q?: string;
  status?: string;
  packageId?: string;
  source?: string;
  utmSource?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: string;
  followup?:string;assigned?:string;
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user=await requireRole(AdminRole.VIEWER);
  const sp = await searchParams;
  const requestedPage=Number.isSafeInteger(Number(sp.page))&&Number(sp.page)>0?Number(sp.page):1;
  const followup=sp.followup==="due"||sp.followup==="today"||sp.followup==="overdue"?sp.followup:undefined;
  const status = Object.values(LeadStatus).includes(sp.status as LeadStatus)
    ? (sp.status as LeadStatus)
    : undefined;

  const sort =
    sp.sort === "createdAt_asc" || sp.sort === "updatedAt_desc"
      ? sp.sort
      : "createdAt_desc";

  const [{ rows, total, pageSize,page }, packages,overview,admins] = await Promise.all([
    listAdminLeads({
      status,
      search: typeof sp.q==="string"?sp.q.trim().slice(0,120):undefined,
      followup,assignedAdminId:sp.assigned==="mine"?user.id:typeof sp.assigned==="string"?sp.assigned.slice(0,160):undefined,
      packageId: sp.packageId || undefined,
      source: sp.source?.trim() || undefined,
      utmSource: sp.utmSource?.trim() || undefined,
      from: sp.from&&isDateOnly(sp.from) ? new Date(sp.from) : undefined,
      to: sp.to&&isDateOnly(sp.to) ? new Date(`${sp.to}T23:59:59.999Z`) : undefined,
      sort,
      page:requestedPage,
      pageSize: 25,
    }),
    prisma.package.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 100,
    }),getLeadCrmOverview(),prisma.adminUser.findMany({where:{deletedAt:null,isActive:true,role:{in:["ADMIN","OWNER"]}},select:{id:true,name:true},orderBy:{name:"asc"}})
  ]);
  const dueDates=new Map((await latestLeadFollowups(rows.map(r=>r.id))).map(r=>[r.leadId,r.dueDate]));
  const conversion=closedLeadConversion(overview.counts.WON,overview.counts.LOST);
  function dueLabel(id:string,status:string){if(!["NEW","CONTACTED","QUALIFIED"].includes(status))return "—";const date=dueDates.get(id);const state=followupState(date,overview.today);return state==="none"?"—":state==="overdue"?"متأخر · "+date:state==="today"?"اليوم":date;}
  const stats=[{label:"تحتاج متابعة",value:overview.due,href:"?followup=due"},{label:"متأخرة",value:overview.overdue,href:"?followup=overdue"},{label:"غير معينة (مفتوحة)",value:overview.unassigned,href:"?assigned=unassigned"}];

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="العملاء المحتملون"
        description="متابعة الاستفسارات والتواصل والتعاقدات. الأرقام في القائمة مقنّعة."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "العملاء المحتملون" },
        ]}
      />

      <nav aria-label="مراحل المبيعات" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{Object.entries(overview.counts).map(([stage,count])=><Link key={stage} href={"/admin/leads?status="+stage} className={"admin-card p-3 "+(status===stage?"border-primary bg-primary/5":"")}><p className="text-xs text-foreground-muted">{leadStageLabels[stage as keyof typeof leadStageLabels]}</p><p className="mt-2 text-2xl font-bold">{count}</p></Link>)}</nav>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">{stats.map(stat=><Link key={stat.label} href={"/admin/leads"+stat.href} className="admin-card p-3"><p className="text-xs text-foreground-muted">{stat.label}</p><p className="mt-2 text-xl font-bold">{stat.value}</p></Link>)}<div className="admin-card p-3"><p className="text-xs text-foreground-muted">نسبة التعاقد من القرارات المغلقة</p><p className="mt-2 text-xl font-bold">{conversion===null?"—":conversion+"%"}</p></div></div>
      <form
        className="admin-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4"
        method="get"
      >
        <label className="text-sm">
          بحث
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            className="admin-input mt-1"
            placeholder="اسم / جوال / مشروع"
          />
        </label>
        <label className="text-sm">
          الحالة
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="admin-input mt-1"
          >
            <option value="">الكل</option>
            {Object.values(LeadStatus).map(s => (
              <option key={s} value={s}>
                {leadStageLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          الباقة
          <select
            name="packageId"
            defaultValue={sp.packageId ?? ""}
            className="admin-input mt-1"
          >
            <option value="">الكل</option>
            {packages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          المصدر
          <input
            name="source"
            defaultValue={sp.source ?? ""}
            className="admin-input mt-1"
          />
        </label>
        <label className="text-sm">
          UTM Source
          <input
            name="utmSource"
            defaultValue={sp.utmSource ?? ""}
            className="admin-input mt-1"
            dir="ltr"
          />
        </label>
        <label className="text-sm">
          من تاريخ
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="admin-input mt-1"
          />
        </label>
        <label className="text-sm">
          إلى تاريخ
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="admin-input mt-1"
          />
        </label>
        <label className="text-sm">
          الترتيب
          <select name="sort" defaultValue={sort} className="admin-input mt-1">
            <option value="createdAt_desc">الأحدث إنشاءً</option>
            <option value="createdAt_asc">الأقدم إنشاءً</option>
            <option value="updatedAt_desc">آخر تحديث</option>
          </select>
        </label>
        <label className="text-sm">المتابعة<select name="followup" defaultValue={followup??""} className="admin-input mt-1"><option value="">الكل</option><option value="due">اليوم والمتأخرة</option><option value="today">اليوم</option><option value="overdue">متأخرة</option></select></label><label className="text-sm">المسؤول<select name="assigned" defaultValue={sp.assigned??""} className="admin-input mt-1"><option value="">الكل</option><option value="mine">طلباتي</option><option value="unassigned">غير معيّن</option>{admins.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            تطبيق الفلاتر
          </button>
          <Link
            href="/admin/leads"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
          >
            مسح
          </Link>
        </div>
      </form>

      <ul className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li>
            <AdminEmptyState title="لا توجد طلبات مطابقة" />
          </li>
        ) : (
          rows.map(lead => (
            <li key={lead.id} className="admin-card p-4 text-sm">
              <Link
                href={`/admin/leads/${lead.id}`}
                className="font-semibold text-primary"
              >
                {lead.name}
              </Link>
              <p className="mt-1 font-mono text-xs">{maskPhone(lead.phone)}</p>
              <p className="mt-1 text-foreground-muted">
                {leadStageLabels[lead.status]} · {lead.source ?? "—"} ·{" "}
                {lead.createdAt.toISOString().slice(0, 10)}
              </p><p className="mt-2 text-xs">المسؤول: {lead.assignedAdmin?.name??"غير معيّن"} · المتابعة: {dueLabel(lead.id,lead.status)}</p>
            </li>
          ))
        )}
      </ul>

      <div className="admin-card hidden overflow-x-auto md:block">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الجوال</th>
              <th>المشروع</th>
              <th>الباقة</th>
              <th>الحالة</th>
              <th>المصدر</th>
              <th>المسؤول</th><th>المتابعة</th>
              <th>تاريخ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا توجد طلبات مطابقة.
                </td>
              </tr>
            ) : (
              rows.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="font-mono text-xs">{maskPhone(lead.phone)}</td>
                  <td>{lead.projectName ?? "—"}</td>
                  <td>{lead.package?.name ?? "—"}</td>
                  <td>
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td>{lead.source ?? "—"}</td>
                  <td className="text-xs">{lead.assignedAdmin?.name??"غير معيّن"}</td><td className="text-xs">{dueLabel(lead.id,lead.status)}</td>
                  <td className="text-xs">
                    {lead.createdAt
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-foreground-muted">
        {total} نتيجة · صفحة {page} من {totalPages}
      </p>
      <AdminPagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/leads"
        searchParams={sp}
      />
    </div>
  );
}
