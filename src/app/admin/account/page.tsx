import {requireAdmin} from "@/server/auth/require-admin";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {RoleBadge} from "@/components/admin/status-badge";
import {ChangePasswordForm} from "@/components/admin/users/change-password-form";
export const dynamic="force-dynamic";
export const metadata={title:"حسابي"};
export default async function Page(){const user=await requireAdmin();return <div className="space-y-5"><AdminPageHeader title="حسابي" description="معلومات الحساب وكلمة المرور."/><section className="admin-card max-w-xl space-y-2 p-5"><h2 className="font-bold">{user.name}</h2><p dir="ltr" className="break-all text-sm text-foreground-muted">{user.email}</p><RoleBadge role={user.role}/></section><ChangePasswordForm/></div>;}
