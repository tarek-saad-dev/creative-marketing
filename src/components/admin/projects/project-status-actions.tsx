"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ContentStatus } from "@/generated/prisma";
import {
  archiveProjectAction,
  publishProjectAction,
  unpublishProjectAction,
} from "@/server/actions/admin/project.action";

export function ProjectStatusActions({
  projectId,
  status,
  canPublish,
}: {
  projectId: string;
  status: ContentStatus;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(
    action: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action(projectId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== ContentStatus.PUBLISHED ? (
        <button
          type="button"
          disabled={pending || !canPublish}
          onClick={() => run(publishProjectAction)}
          className="inline-flex h-9 items-center rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          نشر
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(unpublishProjectAction)}
          className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm"
        >
          إرجاع لمسودة
        </button>
      )}
      {status !== ContentStatus.ARCHIVED ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm("أرشفة هذا المشروع؟ سيختفي من العرض العام.")) {
              run(archiveProjectAction);
            }
          }}
          className="inline-flex h-9 items-center rounded-md border border-amber-300 px-3 text-sm text-amber-900"
        >
          أرشفة
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="w-full text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
