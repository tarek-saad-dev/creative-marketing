"use client";

import { useRouter } from "next/navigation";
import { useState,useTransition } from "react";
import { assignLeadAction } from "@/server/actions/admin/lead.action";

export function LeadAssignSelect({
  leadId,
  assignedAdminId,
  admins,
}: {
  leadId: string;
  assignedAdminId: string | null;
  admins: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [assigned,setAssigned]=useState(assignedAdminId??"");

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value || null;
    startTransition(async () => {
      const result = await assignLeadAction(leadId, { assignedAdminId: value });
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      setAssigned(value??"");router.refresh();
    });
  }

  return (
    <select
      className="admin-input h-10 w-auto"
      value={assigned} aria-label="المسؤول عن الطلب"
      disabled={isPending}
      onChange={handleChange}
    >
      <option value="">غير معيّن</option>
      {admins.map(admin => (
        <option key={admin.id} value={admin.id}>
          {admin.name}
        </option>
      ))}
    </select>
  );
}
