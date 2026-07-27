"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addProjectMediaAction,
  removeProjectMediaAction,
  updateProjectMediaAction,
} from "@/server/actions/admin/project.action";
import { getCloudinaryUploadSignatureAction } from "@/server/actions/admin/cloudinary.action";
import type { AdminProjectDetail } from "@/server/repositories/admin/project.admin.repository";

type MediaRow = AdminProjectDetail["media"][number];

export function ProjectMediaManager({
  projectId,
  projectSlug,
  media,
  cloudinaryConfigured,
}: {
  projectId: string;
  projectSlug: string;
  media: MediaRow[];
  cloudinaryConfigured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const sorted = [...media].sort((a, b) => a.displayOrder - b.displayOrder);

  function refresh() {
    router.refresh();
  }

  async function attachFromUrl(formData: FormData) {
    setError(null);
    const type = String(formData.get("type") ?? "IMAGE") as "IMAGE" | "VIDEO";
    const url = String(formData.get("url") ?? "").trim();
    const altText = String(formData.get("altText") ?? "").trim();
    const caption = String(formData.get("caption") ?? "").trim();
    if (!url) {
      setError("رابط الملف مطلوب");
      return;
    }
    startTransition(async () => {
      const result = await addProjectMediaAction({
        projectId,
        type,
        url,
        altText,
        caption,
        displayOrder: sorted.length,
        thumbnailUrl: "",
        cloudinaryPublicId: "",
        resourceType: type === "VIDEO" ? "video" : "image",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  async function uploadFile(file: File, type: "IMAGE" | "VIDEO") {
    setError(null);
    setUploadProgress("جاري التوقيع…");
    const sig = await getCloudinaryUploadSignatureAction({
      folderKey: "projects",
      projectSlug,
    });
    if (!sig.ok) {
      setError(sig.error);
      setUploadProgress(null);
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sig.data.apiKey);
    body.append("timestamp", String(sig.data.timestamp));
    body.append("signature", sig.data.signature);
    body.append("folder", sig.data.folder);

    setUploadProgress("جاري الرفع…");
    const endpoint = `https://api.cloudinary.com/v1_1/${sig.data.cloudName}/${type === "VIDEO" ? "video" : "image"}/upload`;
    const response = await fetch(endpoint, { method: "POST", body });
    setUploadProgress(null);
    if (!response.ok) {
      setError("فشل رفع الملف إلى Cloudinary");
      return;
    }
    const raw = (await response.json()) as {
      public_id: string;
      secure_url: string;
      resource_type: string;
      format?: string;
      bytes?: number;
      width?: number;
      height?: number;
      duration?: number;
      eager?: Array<{ secure_url: string }>;
    };

    startTransition(async () => {
      const result = await addProjectMediaAction({
        projectId,
        type,
        url: raw.secure_url,
        thumbnailUrl: raw.eager?.[0]?.secure_url ?? raw.secure_url,
        altText: "",
        caption: "",
        displayOrder: sorted.length,
        cloudinaryPublicId: raw.public_id,
        resourceType: raw.resource_type,
        format: raw.format ?? "",
        bytes: raw.bytes ?? null,
        width: raw.width ?? null,
        height: raw.height ?? null,
        duration: raw.duration ?? null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  async function move(mediaId: string, direction: -1 | 1) {
    const index = sorted.findIndex(m => m.id === mediaId);
    const swap = sorted[index + direction];
    if (!swap) return;
    startTransition(async () => {
      await updateProjectMediaAction(mediaId, {
        altText: sorted[index]?.altText ?? "",
        caption: sorted[index]?.caption ?? "",
        displayOrder: swap.displayOrder,
      });
      await updateProjectMediaAction(swap.id, {
        altText: swap.altText ?? "",
        caption: swap.caption ?? "",
        displayOrder: sorted[index]?.displayOrder ?? 0,
      });
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-foreground-muted" dir="ltr">
        project: {projectSlug}
      </p>

      {cloudinaryConfigured ? (
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border px-3 text-sm">
            رفع صورة
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={pending}
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) void uploadFile(file, "IMAGE");
                event.target.value = "";
              }}
            />
          </label>
          <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border px-3 text-sm">
            رفع فيديو
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              disabled={pending}
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) void uploadFile(file, "VIDEO");
                event.target.value = "";
              }}
            />
          </label>
          {uploadProgress ? (
            <span
              className="self-center text-sm text-foreground-muted"
              aria-live="polite"
            >
              {uploadProgress}
            </span>
          ) : null}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-foreground-muted">
          أضف رابط الصورة. يمكنك استخدام روابط الصور الآن، وربط Cloudinary
          لاحقًا.
        </p>
      )}

      <form
        className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2"
        action={attachFromUrl}
      >
        <label className="text-sm">
          النوع
          <select name="type" className="admin-input mt-1" defaultValue="IMAGE">
            <option value="IMAGE">صورة</option>
            <option value="VIDEO">فيديو</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          أضف رابط الصورة
          <input name="url" className="admin-input mt-1" dir="ltr" required />
        </label>
        <label className="text-sm">
          نص بديل
          <input name="altText" className="admin-input mt-1" />
        </label>
        <label className="text-sm">
          تعليق
          <input name="caption" className="admin-input mt-1" />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground sm:col-span-2 sm:justify-self-start"
        >
          إضافة من رابط
        </button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {sorted.length === 0 ? (
          <li className="text-sm text-foreground-muted">لا وسائط بعد.</li>
        ) : (
          sorted.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start gap-3 rounded-lg border border-border p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.altText || ""}
                className="h-16 w-16 rounded object-cover"
              />
              <div className="min-w-0 flex-1 space-y-2 text-sm">
                <p>
                  {item.type} · ترتيب {item.displayOrder}
                </p>
                <form
                  className="grid gap-2 sm:grid-cols-2"
                  onSubmit={event => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    startTransition(async () => {
                      const result = await updateProjectMediaAction(item.id, {
                        altText: String(data.get("altText") ?? ""),
                        caption: String(data.get("caption") ?? ""),
                        displayOrder: item.displayOrder,
                      });
                      if (!result.ok) setError(result.error);
                      else refresh();
                    });
                  }}
                >
                  <input
                    name="altText"
                    defaultValue={item.altText ?? ""}
                    placeholder="نص بديل"
                    className="admin-input"
                    aria-label={`نص بديل للوسيط ${index + 1}`}
                  />
                  <input
                    name="caption"
                    defaultValue={item.caption ?? ""}
                    placeholder="تعليق"
                    className="admin-input"
                    aria-label={`تعليق للوسيط ${index + 1}`}
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-md border border-border px-3 text-xs"
                  >
                    حفظ الوصف
                  </button>
                </form>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="h-8 rounded border border-border px-2 text-xs"
                  disabled={pending || index === 0}
                  onClick={() => void move(item.id, -1)}
                >
                  أعلى
                </button>
                <button
                  type="button"
                  className="h-8 rounded border border-border px-2 text-xs"
                  disabled={pending || index === sorted.length - 1}
                  onClick={() => void move(item.id, 1)}
                >
                  أسفل
                </button>
                <button
                  type="button"
                  className="h-8 rounded border border-destructive/40 px-2 text-xs text-destructive"
                  disabled={pending}
                  onClick={() => {
                    if (
                      window.confirm(
                        "فصل الوسيط عن المشروع؟ لن يُحذف ملف Cloudinary تلقائيًا."
                      )
                    ) {
                      startTransition(async () => {
                        const result = await removeProjectMediaAction(item.id);
                        if (!result.ok) setError(result.error);
                        else refresh();
                      });
                    }
                  }}
                >
                  فصل
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
