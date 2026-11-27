import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {getSiteSettingByKey} from "@/server/repositories/site-settings.repository";
import {HOMEPAGE_EDITOR_KEY,readHomeEditor} from "@/lib/content/homepage-editor";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {HomepageEditorForm} from "@/components/admin/content/homepage-editor-form";
export const dynamic="force-dynamic";
export const metadata={title:"محرر الصفحة الرئيسية"};
export default async function Page(){
 await requireRole(AdminRole.ADMIN);
 const state=readHomeEditor(await getSiteSettingByKey(HOMEPAGE_EDITOR_KEY));
 return <><AdminPageHeader title="محرر الصفحة الرئيسية" description="عدّل ترتيب الأقسام والنصوص واحفظ مسودة قبل النشر." breadcrumbs={[{label:"مركز المحتوى",href:"/admin/content"},{label:"الصفحة الرئيسية"}]}/><HomepageEditorForm initial={state}/></>;
}
