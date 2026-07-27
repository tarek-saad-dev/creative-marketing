import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Settings,
  Briefcase,
  Layers,
  Package,
  Percent,
  MessageSquareQuote,
  ShieldCheck,
  Images,
  HelpCircle,
  Users,
  ScrollText,
  PanelsTopLeft,
} from "lucide-react";
import type { AdminRole } from "@/generated/prisma";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Minimum role required to see this nav item. Undefined = all roles. */
  minimumRole?: AdminRole;
  /** Show a dynamic badge (e.g. new leads). */
  badgeKey?: "leadsNew";
};

/**
 * Primary operator nav — Content Hub first.
 * Advanced pages remain reachable but secondary.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  {
    href: "/admin/content",
    label: "إدارة محتوى الموقع",
    icon: PanelsTopLeft,
  },
  {
    href: "/admin/leads",
    label: "طلبات العملاء",
    icon: Users,
    badgeKey: "leadsNew",
  },
  { href: "/admin/projects", label: "المشاريع (متقدم)", icon: Briefcase },
  { href: "/admin/services", label: "الخدمات (متقدم)", icon: Layers },
  { href: "/admin/packages", label: "الباقات (متقدم)", icon: Package },
  { href: "/admin/offers", label: "العروض (متقدم)", icon: Percent },
  {
    href: "/admin/testimonials",
    label: "الآراء (متقدم)",
    icon: MessageSquareQuote,
  },
  { href: "/admin/trust", label: "الثقة (متقدم)", icon: ShieldCheck },
  { href: "/admin/client-logos", label: "الشعارات (متقدم)", icon: Images },
  { href: "/admin/faqs", label: "الأسئلة (متقدم)", icon: HelpCircle },
  { href: "/admin/settings", label: "الإعدادات (متقدم)", icon: Settings },
  { href: "/admin/audit", label: "سجل النشاط", icon: ScrollText },
];
