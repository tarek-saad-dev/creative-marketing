import Link from "next/link";
import {AdminRole} from "@/generated/prisma";
import {requireRole} from "@/server/auth/require-admin";
import {HomepageView} from "@/components/layout/homepage-view";
export const dynamic="force-dynamic";
export const metadata={title:"معاينة الصفحة الرئيسية",robots:{index:false,follow:false}};
export default async function Page(){await requireRole(AdminRole.ADMIN);return <><div inert><HomepageView preview/></div><div className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center justify-center gap-3 bg-[#111827] px-4 py-3 text-sm text-white"><span>معاينة خاصة · للعرض فقط، لا ترسل طلبات حقيقية</span><Link href="/admin/pages" className="rounded-lg bg-[#27e8c7] px-4 py-2 font-semibold text-[#111827]">العودة للمحرر</Link></div></>;}
