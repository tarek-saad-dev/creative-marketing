import { LogOut } from "lucide-react";
import { signOutAction } from "@/server/actions/admin/auth.action";
import { RoleBadge } from "@/components/admin/status-badge";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { OpenSiteLink } from "@/components/admin/content/content-helpers";
import type { AdminSessionUser } from "@/server/auth/types";

export function AdminTopbar({
  user,
  leadsNew = 0,
}: {
  user: AdminSessionUser;
  leadsNew?: number;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background-elevated px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <AdminMobileNav leadsNew={leadsNew} />
        <p className="hidden text-sm text-foreground-muted sm:block">
          مرحبًا،{" "}
          <span className="font-semibold text-foreground">{user.name}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <OpenSiteLink />
        <RoleBadge role={user.role} />
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </header>
  );
}
