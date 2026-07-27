import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getCurrentAdmin } from "@/server/auth/require-admin";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Only bounce away when the JWT maps to a live active admin.
  // Stale JWTs must not redirect to /admin (that caused login↔admin loops).
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin");
  }

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="font-headline text-xl font-bold text-foreground">
            لوحة تحكم Creative Marketing
          </h1>
          <p className="text-sm text-foreground-muted">
            الدخول مخصص لفريق الإدارة فقط
          </p>
        </div>
        <div className="admin-card p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
