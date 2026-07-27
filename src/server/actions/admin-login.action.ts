"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { INVALID_LOGIN } from "@/auth";

export type LoginState = {
  error: string | null;
};

export async function adminLoginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: INVALID_LOGIN };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: INVALID_LOGIN };
    }
    // Next.js redirect throws NEXT_REDIRECT — rethrow
    throw error;
  }

  return { error: null };
}
