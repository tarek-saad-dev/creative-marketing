"use client";

import { Plus, Pencil } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { PackageForm } from "@/components/admin/packages/package-form";
import type { Package, PackageFeature } from "@/generated/prisma";

type PackageWithFeatures = Package & { features: PackageFeature[] };

export function CreatePackageDialog() {
  return (
    <AdminFormDialog
      title="إضافة باقة جديدة"
      widthClassName="max-w-3xl"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          إضافة باقة
        </button>
      )}
    >
      {close => <PackageForm onDone={close} />}
    </AdminFormDialog>
  );
}

export function EditPackageDialog({
  pkg,
  triggerLabel = "تعديل",
  triggerClassName,
}: {
  pkg: PackageWithFeatures;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  return (
    <AdminFormDialog
      title={`تعديل: ${pkg.name}`}
      widthClassName="max-w-3xl"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className={
            triggerClassName ??
            "inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-primary hover:bg-primary/10"
          }
        >
          {triggerLabel === "تعديل" ? <Pencil className="h-3.5 w-3.5" /> : null}
          {triggerLabel}
        </button>
      )}
    >
      {close => <PackageForm pkg={pkg} onDone={close} />}
    </AdminFormDialog>
  );
}
