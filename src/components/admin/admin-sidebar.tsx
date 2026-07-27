"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "./admin-nav-config";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/content") {
    return (
      pathname === "/admin/content" || pathname.startsWith("/admin/content/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav({
  className = "",
  badgeCounts,
}: {
  className?: string;
  badgeCounts?: { leadsNew?: number };
}) {
  const pathname = usePathname();

  return (
    <nav
      className={`flex flex-col gap-1 ${className}`}
      aria-label="التنقل الرئيسي"
    >
      {ADMIN_NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        const badge =
          item.badgeKey === "leadsNew" ? (badgeCounts?.leadsNew ?? 0) : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="admin-nav-link"
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {badge > 0 ? (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white group-data-[active=true]:bg-primary/10 group-data-[active=true]:text-primary">
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({
  badgeCounts,
}: {
  badgeCounts?: { leadsNew?: number };
}) {
  return (
    <aside className="hidden w-64 shrink-0 border-e border-border bg-primary lg:flex lg:flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="leading-tight text-white">
          <p className="font-headline text-sm font-bold">Creative Marketing</p>
          <p className="text-xs text-white/70">لوحة التحكم</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 [&_.admin-nav-link]:text-white/75 [&_.admin-nav-link:hover]:bg-white/10 [&_.admin-nav-link:hover]:text-white [&_.admin-nav-link[data-active='true']]:bg-white [&_.admin-nav-link[data-active='true']]:text-primary">
        <AdminSidebarNav badgeCounts={badgeCounts} />
      </div>
    </aside>
  );
}
