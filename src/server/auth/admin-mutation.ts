import "server-only";

import { ZodError } from "zod";
import { auth } from "@/auth";
import type { AdminRole, Prisma } from "@/generated/prisma";
import { hasRoleAtLeast, type AdminSessionUser } from "@/server/auth/types";
import { logAdminAction } from "@/server/services/admin-audit.service";

export type AdminMutationSuccess<T> = { ok: true; data: T };
export type AdminMutationFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};
export type AdminMutationResult<T> =
  | AdminMutationSuccess<T>
  | AdminMutationFailure;

/** Reads the current admin session without redirecting. For Server Actions. */
export async function getSessionAdmin(): Promise<AdminSessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) return null;
  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email,
    role: user.role,
  };
}

export type AdminAuditInfo = {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export type WithAdminMutationOptions<T> = {
  /** Minimum role rank required (OWNER > ADMIN > EDITOR > VIEWER). */
  minimumRole?: AdminRole;
  /** Static audit info, or a function computed from the handler's result. */
  audit?:
    | AdminAuditInfo
    | ((result: T, user: AdminSessionUser) => AdminAuditInfo | null);
};

const GENERIC_ERROR = "تعذر تنفيذ العملية. حاول مرة أخرى.";

function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    fieldErrors[key] = fieldErrors[key] ?? [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

/**
 * Wraps every admin Server Action mutation with:
 *  - session + role enforcement (no redirect — returns a typed failure)
 *  - Zod error → field-level error mapping
 *  - generic error messages for unexpected failures (no internals leaked)
 *  - automatic audit-log write on success (when `audit` is provided)
 *
 * Handlers should throw `Error(message)` for expected domain failures
 * (e.g. "SLUG_TAKEN") — map those to Arabic copy in the calling action if
 * needed, or return a mapped message directly from the handler via a thrown
 * Error whose `message` is already user-facing.
 */
export async function withAdminMutation<T>(
  options: WithAdminMutationOptions<T>,
  handler: (user: AdminSessionUser) => Promise<T>
): Promise<AdminMutationResult<T>> {
  let user: AdminSessionUser | null;
  try {
    user = await getSessionAdmin();
  } catch {
    return { ok: false, error: "يجب تسجيل الدخول." };
  }

  if (!user) {
    return { ok: false, error: "يجب تسجيل الدخول." };
  }

  if (options.minimumRole && !hasRoleAtLeast(user.role, options.minimumRole)) {
    return { ok: false, error: "ليس لديك صلاحية لتنفيذ هذا الإجراء." };
  }

  try {
    const data = await handler(user);

    const auditInfo =
      typeof options.audit === "function"
        ? options.audit(data, user)
        : options.audit;

    if (auditInfo) {
      await logAdminAction({ adminUserId: user.id, ...auditInfo });
    }

    return { ok: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: "بيانات غير صالحة",
        fieldErrors: zodFieldErrors(error),
      };
    }
    if (error instanceof Error && error.message) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: GENERIC_ERROR };
  }
}
