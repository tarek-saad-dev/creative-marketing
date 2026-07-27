"use client";

import { Plus, Pencil } from "lucide-react";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { OfferForm } from "@/components/admin/offers/offer-form";
import type { LimitedOffer, OfferPackage, Package } from "@/generated/prisma";

type OfferWithPackages = LimitedOffer & {
  offerPackages: Array<
    OfferPackage & { package: Pick<Package, "id" | "name" | "originalPrice"> }
  >;
};

type AvailablePackage = {
  id: string;
  name: string;
  originalPrice: { toString(): string } | string | number | null;
};

export function CreateOfferDialog({
  availablePackages,
}: {
  availablePackages: AvailablePackage[];
}) {
  return (
    <AdminFormDialog
      title="إضافة عرض محدود"
      widthClassName="max-w-2xl"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          إنشاء عرض جديد
        </button>
      )}
    >
      {close => (
        <OfferForm availablePackages={availablePackages} onDone={close} />
      )}
    </AdminFormDialog>
  );
}

export function EditOfferDialog({
  offer,
  availablePackages,
}: {
  offer: OfferWithPackages;
  availablePackages: AvailablePackage[];
}) {
  return (
    <AdminFormDialog
      title={`تعديل: ${offer.name}`}
      widthClassName="max-w-2xl"
      trigger={open => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
      )}
    >
      {close => (
        <OfferForm
          offer={offer}
          availablePackages={availablePackages}
          onDone={close}
        />
      )}
    </AdminFormDialog>
  );
}
