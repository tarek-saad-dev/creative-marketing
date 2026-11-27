import {roleAtLeast,type SimpleAdminRole} from "./roles";
export const workspaceGroups=[
 {label:"إدارة",items:[{href:"/admin",label:"الرئيسية",icon:"dashboard"},{href:"/admin/leads",label:"طلبات العملاء",icon:"leads",badgeKey:"leadsNew"}]},
 {label:"الموقع والمحتوى",items:[{href:"/admin/content",label:"مركز المحتوى",icon:"content",aliases:["/admin/services","/admin/packages","/admin/offers","/admin/testimonials","/admin/trust","/admin/client-logos","/admin/faqs"]},{href:"/admin/projects",label:"المشاريع والأعمال",icon:"projects"},{href:"/admin/portfolio",label:"استعراض الأعمال",icon:"portfolio",minimumRole:"ADMIN"},{href:"/admin/brand",label:"الهوية واللوجو",icon:"brand",minimumRole:"ADMIN"}]},
 {label:"النظام",items:[{href:"/admin/settings",label:"الإعدادات",icon:"settings",minimumRole:"ADMIN"},{href:"/admin/audit",label:"سجل النشاط",icon:"audit",minimumRole:"ADMIN"}]}
] as const satisfies readonly {label:string;items:readonly WorkspaceItem[]}[];
type WorkspaceItem={href:string;label:string;icon:string;minimumRole?:SimpleAdminRole;aliases?:readonly string[];badgeKey?:string};
export function visibleWorkspaceGroups(role:SimpleAdminRole){
 return workspaceGroups.map(group=>({label:group.label,items:(group.items as readonly WorkspaceItem[]).filter(item=>!item.minimumRole||roleAtLeast(role,item.minimumRole))})).filter(group=>group.items.length);
}
export function workspaceItemActive(pathname:string,item:WorkspaceItem){
 const matches=(href:string)=>pathname===href||(href!=="/admin"&&pathname.startsWith(href+"/"));
 return matches(item.href)||(item.aliases??[]).some(matches);
}
