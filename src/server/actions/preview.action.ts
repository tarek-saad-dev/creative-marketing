"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth/require-admin";

/**
 * Enables Next.js Draft Mode for the current admin, then redirects to the
 * requested public path so unpublished/draft content can be reviewed using
 * the normal public rendering path. Gated by `requireAdmin()` — draft mode
 * can only ever be turned on by an authenticated admin.
 */
export async function enablePreviewAction(path: string): Promise<void> {
  await requireAdmin();
  const draft = await draftMode();
  draft.enable();
  redirect(path && path.startsWith("/") ? path : "/");
}

export async function disablePreviewAction(path: string): Promise<void> {
  const draft = await draftMode();
  draft.disable();
  redirect(path && path.startsWith("/") ? path : "/");
}
