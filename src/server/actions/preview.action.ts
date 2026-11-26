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
function safePreviewPath(path:string){return path.startsWith("/")&&!path.startsWith("//")&&!/[\\\\\u0000-\u001f]/.test(path)?path:"/";}

export async function enablePreviewAction(path: string): Promise<void> {
  await requireAdmin();
  const draft = await draftMode();
  draft.enable();
  redirect(safePreviewPath(path));
}

export async function disablePreviewAction(path: string): Promise<void> {
  const draft = await draftMode();
  draft.disable();
  redirect(safePreviewPath(path));
}
