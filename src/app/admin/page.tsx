import Link from "next/link";
import {
  AlertTriangle,
  Briefcase,
  MessageSquareQuote,
  Package,
  Percent,
  Settings,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/server/auth/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  getAdminDashboardData,
  getRecentAuditActivity,
} from "@/server/services/admin/dashboard.admin.service";
import { formatDateTime } from "@/lib/utils";
import { OpenSiteLink } from "@/components/admin/content/content-helpers";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  {
    href: "/admin/projects/new",
    label: "أضف مشروعًا",
    icon: Briefcase,
  },
  {
    href: "/admin/content?section=settings",
    label: "عدّل بيانات الموقع",
    icon: Settings,
  },
  {
    href: "/admin/content?section=packages",
    label: "أضف أسعار الباكدجات",
    icon: Package,
  },
  {
    href: "/admin/content?section=offers",
    label: "أنشئ عرضًا",
    icon: Percent,
  },
  {
    href: "/admin/content?section=testimonials",
    label: "أضف رأي عميل",
    icon: MessageSquareQuote,
  },
  {
    href: "/admin/leads",
    label: "راجع طلبات العملاء",
    icon: Users,
  },
] as const;

const WARNING_ACTIONS: Record<string, { label: string; href: string }> = {
  "no-published-projects": {
    label: "أضف مشروعًا الآن",
    href: "/admin/projects/new",
  },
  "packages-no-price": {
    label: "أضف الأسعار الآن",
    href: "/admin/content?section=packages",
  },
  "packages-invalid-price": {
    label: "أضف الأسعار الآن",
    href: "/admin/content?section=packages",
  },
  "whatsapp-missing": {
    label: "أضف رقم واتساب",
    href: "/admin/content?section=settings",
  },
  "no-active-offer": {
    label: "أنشئ عرضًا",
    href: "/admin/content?section=offers",
  },
  "no-testimonials": {
    label: "أضف رأي عميل",
    href: "/admin/content?section=testimonials",
  },
  "cloudinary-not-configured": {
    label: "إدارة الصور",
    href: "/admin/content?section=projects",
  },
  "leads-new": {
    label: "راجع الطلبات",
    href: "/admin/leads",
  },
  "trust-incomplete": {
    label: "راجع أرقام الثقة",
    href: "/admin/content?section=trust",
  },
  "testimonials-unapproved": {
    label: "راجع الآراء",
    href: "/admin/content?section=testimonials",
  },
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [data, recentActivity] = await Promise.all([
    getAdminDashboardData(),
    getRecentAuditActivity(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="لوحة التحكم"
        description="ابدأ من هنا — إجراءات سريعة وتنبيهات واضحة"
        actions={<OpenSiteLink />}
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="admin-card flex items-center gap-3 p-4 transition-shadow hover:shadow-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>

      {data.warnings.length > 0 ? (
        <div className="admin-card mb-6 space-y-3 border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <h2 className="text-sm font-semibold">تنبيهات تحتاج متابعة</h2>
          </div>
          <ul className="space-y-3">
            {data.warnings.map(warning => {
              const action = WARNING_ACTIONS[warning.id];
              return (
                <li
                  key={warning.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm text-amber-900"
                >
                  <span>{warning.message}</span>
                  {action ? (
                    <Link
                      href={action.href}
                      className="inline-flex h-8 items-center rounded-md bg-amber-900 px-3 text-xs font-semibold text-amber-50 hover:bg-amber-950"
                    >
                      {action.label}
                    </Link>
                  ) : warning.href ? (
                    <Link
                      href={warning.href}
                      className="text-xs font-semibold underline"
                    >
                      فتح
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="admin-card mb-6 border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          لا توجد تنبيهات حاليًا — كل شيء يبدو جيدًا.
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/content"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          إدارة محتوى الموقع
        </Link>
        <Link
          href="/admin/leads"
          className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold text-foreground"
        >
          طلبات العملاء
          {data.counts.leadsNew > 0 ? (
            <span className="ms-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {data.counts.leadsNew}
            </span>
          ) : null}
        </Link>
      </div>

      <div className="admin-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          آخر النشاطات
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            لا يوجد نشاط مسجل بعد.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentActivity.map(entry => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {entry.adminUser?.name ?? "نظام"}
                  </span>{" "}
                  <span className="text-foreground-muted">
                    — {entry.action}
                  </span>
                </div>
                <time
                  className="shrink-0 text-xs text-foreground-muted"
                  dateTime={entry.createdAt.toISOString()}
                >
                  {formatDateTime(entry.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 text-end">
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-primary hover:underline"
          >
            عرض سجل النشاط بالكامل ←
          </Link>
        </div>
      </div>
    </div>
  );
}
