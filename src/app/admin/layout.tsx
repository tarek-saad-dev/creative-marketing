import type { Metadata } from "next";
import { LeadStatus } from "@/generated/prisma";
import { getCurrentAdmin } from "@/server/auth/require-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import type { AdminSessionUser } from "@/server/auth/types";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: {
    default: "لوحة التحكم",
    template: "%s | لوحة التحكم",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefer live DB admin over raw JWT so stale sessions don't wrap /login.
  const admin = await getCurrentAdmin();

  if (!admin) {
    return <>{children}</>;
  }

  const user: AdminSessionUser = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };

  const leadsNew = await prisma.lead.count({
    where: { status: LeadStatus.NEW },
  });

  return (
    <div className="admin-shell flex min-h-screen bg-[#F8FAFC] text-[#1B2A4A]">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-modal focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        تخطي إلى المحتوى
      </a>
      <AdminSidebar badgeCounts={{ leadsNew }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} leadsNew={leadsNew} />
        <main id="admin-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
