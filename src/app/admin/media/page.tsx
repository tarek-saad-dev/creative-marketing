import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {listMediaLibrary} from "@/server/services/admin/media-library.service";
import {isCloudinaryConfigured} from "@/lib/env/server";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {MediaLibrary} from "@/components/admin/media/media-library";
export const dynamic="force-dynamic";
export const metadata={title:"مكتبة الوسائط"};
export default async function Page(){await requireRole(AdminRole.EDITOR);const items=await listMediaLibrary();return <><AdminPageHeader title="مكتبة الوسائط" description="الصور والفيديوهات المستخدمة في الموقع والملفات المستقلة." breadcrumbs={[{label:"مركز المحتوى",href:"/admin/content"},{label:"مكتبة الوسائط"}]}/><MediaLibrary items={items} cloudinaryConfigured={isCloudinaryConfigured()}/></>;}
