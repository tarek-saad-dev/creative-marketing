import Link from "next/link";
import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {listMediaLibrary} from "@/server/services/admin/media-library.service";
import {isCloudinaryConfigured} from "@/lib/env/server";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {MediaLibrary} from "@/components/admin/media/media-library";
export const dynamic="force-dynamic";
export const metadata={title:"مكتبة الوسائط"};
export default async function Page(){await requireRole(AdminRole.EDITOR);const items=await listMediaLibrary();return <><AdminPageHeader title="مكتبة الوسائط" description="الصور والفيديوهات المستخدمة في الموقع والملفات المستقلة." breadcrumbs={[{label:"مركز المحتوى",href:"/admin/content"},{label:"مكتبة الوسائط"}]}/><div className="admin-card mb-4 flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-bold">عاوز ترفع شغل لعرضه في الموقع؟</p><p className="text-xs leading-6 text-foreground-muted">ابدأ بمشروع، ثم ارفع أو اختر التصميمات من المكتبة داخله. الرفع للمكتبة وحده لا ينشر الملفات في معرض الأعمال.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/projects/new" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">مشروع جديد</Link><Link href="/admin/projects" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm">مشروع موجود</Link></div></div><MediaLibrary items={items} cloudinaryConfigured={isCloudinaryConfigured()}/></>;}
