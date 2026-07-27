import { compare, hash } from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/** Constant-time verification via bcryptjs. */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return compare(password, passwordHash);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) {
    return "كلمة المرور يجب أن تكون 12 حرفًا على الأقل.";
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return "كلمة المرور تحتاج حروفًا كبيرة وصغيرة.";
  }
  if (!/[0-9]/.test(password)) {
    return "كلمة المرور تحتاج رقمًا واحدًا على الأقل.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "كلمة المرور تحتاج رمزًا خاصًا واحدًا على الأقل.";
  }
  return null;
}
