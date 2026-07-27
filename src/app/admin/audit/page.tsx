import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RoleBadge } from "@/components/admin/status-badge";
import { AdminPagination } from "@/components/admin/pagination";
import {
  listAuditLogs,
  listDistinctAuditEntityTypes,
} from "@/server/repositories/admin-audit.repository";
import { listAdminUsers } from "@/server/repositories/admin-user.repository";
import { safeMetadataSummary } from "@/server/admin/serialization";
import { formatDateTime, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "سجل النشاط" };
export const dynamic = "force-dynamic";

type Search = {
  entityType?: string;
  adminUserId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: string;
};

function buildHref(base: Search, overrides: Partial<Search>): string {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/admin/audit?${qs}` : "/admin/audit";
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireRole(AdminRole.ADMIN);
  const sp = await searchParams;
  const pageNumber = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const [{ rows, total, pageSize }, entityTypes, admins] = await Promise.all([
    listAuditLogs({
      entityType: sp.entityType,
      adminUserId: sp.adminUserId,
      action: sp.action?.trim() || undefined,
      from: sp.from ? new Date(sp.from) : undefined,
      to: sp.to ? new Date(`${sp.to}T23:59:59.999Z`) : undefined,
      page: pageNumber,
    }),
    listDistinctAuditEntityTypes(),
    listAdminUsers(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <AdminPageHeader
        title="سجل النشاط"
        description="سجل آمن لإجراءات الإدارة — بدون كلمات مرور أو أسرار أو حمولة Lead كاملة."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "سجل النشاط" },
        ]}
      />

      <form
        method="get"
        className="admin-card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-sm">
          المسؤول
          <select
            name="adminUserId"
            defaultValue={sp.adminUserId ?? ""}
            className="admin-input mt-1"
          >
            <option value="">الكل</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          الإجراء
          <input
            name="action"
            defaultValue={sp.action ?? ""}
            className="admin-input mt-1"
            dir="ltr"
            placeholder="lead.status"
          />
        </label>
        <label className="text-sm">
          النوع
          <select
            name="entityType"
            defaultValue={sp.entityType ?? ""}
            className="admin-input mt-1"
          >
            <option value="">الكل</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          من
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="admin-input mt-1"
          />
        </label>
        <label className="text-sm">
          إلى
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="admin-input mt-1"
          />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            تطبيق
          </button>
          <Link
            href="/admin/audit"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
          >
            مسح
          </Link>
        </div>
      </form>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href={buildHref(sp, { entityType: "", page: "1" })}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
            !sp.entityType
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground-muted hover:bg-muted/70"
          )}
        >
          الكل
        </Link>
        {entityTypes.map(type => (
          <Link
            key={type}
            href={buildHref(sp, { entityType: type, page: "1" })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              sp.entityType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground-muted hover:bg-muted/70"
            )}
          >
            {type}
          </Link>
        ))}
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>الوقت</th>
              <th>المسؤول</th>
              <th>الإجراء</th>
              <th>النوع</th>
              <th>المعرّف</th>
              <th>ملخص</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-foreground-muted"
                >
                  لا يوجد نشاط مسجل.
                </td>
              </tr>
            ) : (
              rows.map(entry => (
                <tr key={entry.id}>
                  <td className="text-xs text-foreground-muted">
                    {formatDateTime(entry.createdAt)}
                  </td>
                  <td>
                    {entry.adminUser ? (
                      <span className="inline-flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1.5">
                          {entry.adminUser.name}
                          <RoleBadge role={entry.adminUser.role} />
                        </span>
                        <span
                          className="text-[10px] text-foreground-muted"
                          dir="ltr"
                        >
                          {entry.adminUser.email}
                        </span>
                      </span>
                    ) : (
                      "نظام"
                    )}
                  </td>
                  <td className="font-mono text-xs" dir="ltr">
                    {entry.action}
                  </td>
                  <td>{entry.entityType}</td>
                  <td
                    className="font-mono text-xs text-foreground-muted"
                    dir="ltr"
                  >
                    {entry.entityId ?? "—"}
                  </td>
                  <td
                    className="max-w-[12rem] truncate font-mono text-[10px] text-foreground-muted"
                    dir="ltr"
                    title={safeMetadataSummary(entry.metadata, 500)}
                  >
                    {safeMetadataSummary(entry.metadata)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        page={pageNumber}
        totalPages={totalPages}
        basePath="/admin/audit"
        searchParams={sp}
      />
    </div>
  );
}
