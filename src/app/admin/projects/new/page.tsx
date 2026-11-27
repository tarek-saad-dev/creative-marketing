import Link from "next/link";
import {readProjectOrigin,artworkReturnHref,sectionNames} from "@/lib/admin/website-workspace";
import type { Metadata } from "next";
import { requireRole } from "@/server/auth/require-admin";
import { AdminRole } from "@/generated/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { QuickProjectForm } from "@/components/admin/projects/quick-project-form";
import { listAdminServices } from "@/server/services/admin/service.admin.service";

export const metadata: Metadata = { title: "إضافة مشروع" };
export const dynamic = "force-dynamic";

export default async function NewAdminProjectPage({searchParams}:{searchParams:Promise<{from?:string}>}) {
  const user=await requireRole(AdminRole.EDITOR);
  const origin=["ADMIN","OWNER"].includes(user.role)?readProjectOrigin((await searchParams).from):null;
  const services = await listAdminServices();

  return (
    <div>
      <AdminPageHeader
        title="إضافة مشروع جديد"
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الأعمال", href: "/admin/projects" },
          { label: "إضافة مشروع" },
        ]}
      />
      {origin&&<div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><p className="font-bold">بتضيف مشروع علشان يظهر في: {sectionNames[origin]}</p><p className="mt-1 text-foreground-muted">بعد النشر هترجع للقسم ده عشان تختار طريقة عرضه.</p><Link href={artworkReturnHref(origin)} className="mt-2 inline-flex min-h-10 items-center font-semibold text-primary">العودة للقسم</Link></div>}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">{["01 · إنشاء المسودة","02 · رفع الأعمال واختيار الغلاف","03 · معاينة ونشر"].map((step,i)=><div key={step} className={"rounded-xl border p-4 text-sm font-semibold "+(i===0?"border-primary text-primary":"border-border text-foreground-muted")}>{step}</div>)}</div>
      <div>
        <QuickProjectForm origin={origin}
          services={services
            .filter(s => s.isActive)
            .map(s => ({ id: s.id, nameAr: s.nameAr }))}
        />
      </div>
    </div>
  );
}
