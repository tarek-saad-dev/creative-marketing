import Link from "next/link";
import {ViewerReadonlyBanner} from "@/components/admin/content/content-helpers";
import {queryProjectsForAdmin} from "@/server/repositories/admin/project.admin.repository";
import {parseProjectFilters} from "@/lib/admin/project-filters";
import {Briefcase,ArrowUpLeft,Plus} from "lucide-react";
export async function ProjectsPanel({canEdit}:{canEdit:boolean}){
 const {counts}=await queryProjectsForAdmin(parseProjectFilters({}));
 return <div className="space-y-4"><ViewerReadonlyBanner canEdit={canEdit}/><section className="admin-card p-5"><div className="flex items-center gap-3"><Briefcase size={24} className="text-primary"/><div><h2 className="font-headline text-xl font-bold">إدارة المشاريع</h2><p className="text-sm text-foreground-muted">محرر موحد للمشاريع والأعمال بدل تكرار القوائم.</p></div></div><div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{label:"منشورة",key:"published"},{label:"مسودات",key:"draft"},{label:"مؤرشفة",key:"archived"},{label:"محذوفة",key:"deleted"}].map(item=><Link key={item.key} href={"/admin/projects?status="+item.key} className="rounded-lg border border-border p-3"><p className="text-xl font-bold">{counts[item.key as "published"|"draft"|"archived"|"deleted"]}</p><p className="text-xs text-foreground-muted">{item.label}</p></Link>)}</div><div className="flex flex-wrap gap-3"><Link href="/admin/projects" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">فتح المشاريع <ArrowUpLeft size={17}/></Link>{canEdit&&<Link href="/admin/projects/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold"><Plus size={17}/>إضافة مشروع</Link>}</div></section></div>;
}
