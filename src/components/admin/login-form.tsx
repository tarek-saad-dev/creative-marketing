"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  loginAction,
  type LoginActionResult,
} from "@/server/actions/admin/auth.action";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    LoginActionResult | null,
    FormData
  >(loginAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="admin-label">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="admin-input"
          dir="ltr"
        />
      </div>
      <div>
        <label htmlFor="password" className="admin-label">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="admin-input"
          dir="ltr"
        />
      </div>
      {state && !state.ok ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "جارٍ الدخول…" : "تسجيل الدخول"}
      </button>
    </form>
  );
}
