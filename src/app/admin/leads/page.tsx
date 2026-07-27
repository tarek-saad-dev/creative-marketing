import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatus, AdminRole } from "@/generated/prisma";
import { requireRole } from "@/server/auth/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPagination } from "@/components/admin/pagination";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import { listAdminLeads } from "@/server/services/admin/lead.admin.service";
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
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireRole(AdminRole.VIEWER);
  const sp = await searchParams;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const status = Object.values(LeadStatus).includes(sp.status as LeadStatus)
    ? (sp.status as LeadStatus)
    : undefined;

  const sort =
    sp.sort === "createdAt_asc" || sp.sort === "updatedAt_desc"
      ? sp.sort
      : "createdAt_desc";

  const [{ rows, total, pageSize }, packages] = await Promise.all([
    listAdminLeads({
      status,
      search: sp.q?.trim() || undefined,
      packageId: sp.packageId || undefined,
      source: sp.source?.trim() || undefined,
      utmSource: sp.utmSource?.trim() || undefined,
      from: sp.from ? new Date(sp.from) : undefined,
      to: sp.to ? new Date(`${sp.to}T23:59:59.999Z`) : undefined,
      sort,
      page,
      pageSize: 25,
    }),
    prisma.package.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="العملاء المحتملون"
        description="CRM داخلي — بدون حذف نهائي. الهاتف مقنّع في القائمة."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "العملاء المحتملون" },
        ]}
      />

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
                {s}
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
                {lead.status} · {lead.source ?? "—"} ·{" "}
                {lead.createdAt.toISOString().slice(0, 10)}
              </p>
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
              <th>UTM</th>
              <th>تاريخ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
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
                  <td className="text-xs" dir="ltr">
                    {lead.utmSource ?? "—"}
                  </td>
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
