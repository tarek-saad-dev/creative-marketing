import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {listAdminUsers} from "@/server/repositories/admin-user.repository";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {TeamWorkspace} from "@/components/admin/users/team-workspace";
export const dynamic="force-dynamic";
export const metadata={title:"الفريق والصلاحيات"};
export default async function Page(){const actor=await requireRole(AdminRole.OWNER);const members=(await listAdminUsers()).map(m=>({id:m.id,name:m.name,email:m.email,role:m.role,isActive:m.isActive,lastLoginAt:m.lastLoginAt?.toISOString()??null}));return <div className="space-y-5"><AdminPageHeader title="الفريق والصلاحيات" description="إدارة حسابات فريق Creative Marketing — للمالك فقط."/><TeamWorkspace members={members} actorId={actor.id}/><section className="admin-card p-4"><h2 className="font-headline font-bold">مستويات الصلاحيات</h2><dl className="mt-3 grid gap-3 sm:grid-cols-2">{[{role:"OWNER",text:"إدارة الفريق والنظام وكل المحتوى"},{role:"ADMIN",text:"المحتوى والأسعار والنشر والعملاء والإعدادات"},{role:"EDITOR",text:"إدارة المحتوى والمشاريع والوسائط وتجهيز مسودات الباقات"},{role:"VIEWER",text:"مشاهدة الصفحات المسموحة دون تعديل"}].map(r=><div key={r.role} className="rounded-lg border border-border p-3"><dt className="font-bold" dir="ltr">{r.role}</dt><dd className="mt-1 text-sm text-foreground-muted">{r.text}</dd></div>)}</dl></section></div>;}
