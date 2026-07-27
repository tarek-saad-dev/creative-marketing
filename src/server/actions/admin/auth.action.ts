"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginActionResult = { ok: true } | { ok: false; error: string };

const GENERIC_LOGIN_ERROR = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

/**
 * Always returns the same generic failure message regardless of the actual
 * cause (unknown email, wrong password, disabled account) so the login
 * form never leaks account existence.
 */
export async function loginAction(
  _prevState: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: GENERIC_LOGIN_ERROR };
    }
    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
