"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {ADMIN_NAV_ICONS} from "./admin-nav-config";
import {visibleWorkspaceGroups,workspaceItemActive} from "@/lib/admin/workspace";
import type {SimpleAdminRole} from "@/lib/admin/roles";
export function AdminSidebarNav({role,badgeCounts,onNavigate}:{role:SimpleAdminRole;badgeCounts?:{leadsNew?:number};onNavigate?:()=>void}){
 const pathname=usePathname();
 return <nav aria-label="التنقل الرئيسي" className="space-y-4">{visibleWorkspaceGroups(role).map((group,index)=><details key={group.label+pathname} open={index===0||group.items.some(item=>workspaceItemActive(pathname,item))} className="space-y-1.5">
 <summary className="cursor-pointer rounded px-3 py-2 text-xs font-semibold text-white/80">{group.label}</summary>
 {group.items.map(item=>{const Icon=ADMIN_NAV_ICONS[item.icon as keyof typeof ADMIN_NAV_ICONS];const active=workspaceItemActive(pathname,item);const badge=item.badgeKey==="leadsNew"?(badgeCounts?.leadsNew??0):0;
 return <Link key={item.href} href={item.href} onClick={onNavigate} className={"flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors "+(active?"bg-white text-[#2c1f73]":"text-white/85 hover:bg-white/10 hover:text-white")} aria-current={active?"page":undefined}><Icon size={18} aria-hidden="true" className="shrink-0"/><span className="flex-1">{item.label}</span>{badge>0&&<span className={"rounded-full px-2 py-0.5 text-xs font-bold "+(active?"bg-[#2c1f73]/10 text-[#2c1f73]":"bg-white/15 text-white")}>{badge>99?"99+":badge}</span>}</Link>})}
 </details>)}</nav>;
}
export function AdminSidebar({role,badgeCounts}:{role:SimpleAdminRole;badgeCounts?:{leadsNew?:number}}){
 return <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-[#2c1f73] text-white lg:flex">
 <Link href="/admin" className="flex items-center gap-3 px-5 py-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#27e8c7] font-bold text-[#111827]">CM</span><div><p className="font-headline text-sm font-bold">Creative Marketing</p><p className="mt-1 text-[11px] text-white/70">CMS WORKSPACE</p></div></Link>
 <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4"><AdminSidebarNav role={role} badgeCounts={badgeCounts}/></div>
 <p className="border-t border-white/15 px-5 py-4 text-[11px] text-white/65">WE THINK. WE CREATE. YOU GROW.</p>
 </aside>;
}
