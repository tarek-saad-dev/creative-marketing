import "server-only";

import { prisma } from "@/lib/db/prisma";
import { LeadStatus, Prisma } from "@/generated/prisma";

export const adminLeadListSelect = {
  id: true,
  name: true,
  phone: true,
  projectName: true,
  industry: true,
  status: true,
  source: true,
  utmSource: true,
  createdAt: true,
  updatedAt: true,
  package: { select: { id: true, name: true } },
  assignedAdmin: { select: { id: true, name: true } },
} satisfies Prisma.LeadSelect;

export type AdminLeadListRow = Prisma.LeadGetPayload<{
  select: typeof adminLeadListSelect;
}>;

export type LeadListFilter = {
  status?: LeadStatus;
  search?: string;
  packageId?: string;
  source?: string;
  utmSource?: string;
  from?: Date;
  to?: Date;
  sort?: "createdAt_desc" | "createdAt_asc" | "updatedAt_desc";
  page?: number;
  pageSize?: number;
  assignedAdminId?:string;
  followup?: "due"|"today"|"overdue";
};

export async function listLeadsForAdmin(options: LeadListFilter = {}): Promise<{
  rows: AdminLeadListRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const requestedPage=Number.isSafeInteger(options.page)&&Number(options.page)>0?Math.min(Number(options.page),100000):1;
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 25));

  const followupIds=options.followup?await findFollowupLeadIds(options.followup):undefined;
  const where: Prisma.LeadWhereInput = {
    ...(followupIds?{id:{in:followupIds}}:{}),
    ...(options.assignedAdminId?{assignedAdminId:options.assignedAdminId==="unassigned"?null:options.assignedAdminId}:{}),
    ...(options.status ? { status: options.status } : {}),
    ...(options.packageId ? { packageId: options.packageId } : {}),
    ...(options.source
      ? { source: { contains: options.source, mode: "insensitive" } }
      : {}),
    ...(options.utmSource
      ? { utmSource: { contains: options.utmSource, mode: "insensitive" } }
      : {}),
    ...(options.from || options.to
      ? {
          createdAt: {
            ...(options.from ? { gte: options.from } : {}),
            ...(options.to ? { lte: options.to } : {}),
          },
        }
      : {}),
    ...(options.search
      ? {
          OR: [
            { name: { contains: options.search, mode: "insensitive" } },
            { phone: { contains: options.search, mode: "insensitive" } },
            { projectName: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.LeadOrderByWithRelationInput =
    options.sort === "createdAt_asc"
      ? { createdAt: "asc" }
      : options.sort === "updatedAt_desc"
        ? { updatedAt: "desc" }
        : { createdAt: "desc" };

  const total=await prisma.lead.count({where});
  const page=Math.min(requestedPage,Math.max(1,Math.ceil(total/pageSize)));
  const rows=await prisma.lead.findMany({
      where,
      orderBy:[orderBy,{id:"asc"}],
      select: adminLeadListSelect,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

  return { rows, total, page, pageSize };
}

export async function findLeadByIdForAdmin(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      package: { select: { id: true, name: true } },
      assignedAdmin: { select: { id: true, name: true } },
      events: { orderBy: [{createdAt:"desc"},{id:"desc"}],take:100 },
    },
  });
}

export async function countLeadsByStatus() {
  return prisma.lead.groupBy({ by: ["status"], _count: { _all: true } });
}

export async function updateLeadStatusRow(id: string, status: LeadStatus) {
  return prisma.lead.update({
    where: { id },
    data: { status },
    select: { id: true, status: true, name: true },
  });
}

export async function updateLeadInternalNoteRow(
  id: string,
  internalNote: string | null
) {
  return prisma.lead.update({
    where: { id },
    data: { internalNote },
    select: { id: true },
  });
}

export async function assignLeadRow(
  id: string,
  assignedAdminId: string | null
) {
  return prisma.lead.update({
    where: { id },
    data: { assignedAdminId },
    select: {
      id: true,
      assignedAdmin: { select: { id: true, name: true } },
    },
  });
}

export async function createLeadEventRow(
  leadId: string,
  type: Prisma.LeadEventCreateInput["type"],
  metadata?: Prisma.InputJsonValue
) {
  return prisma.leadEvent.create({
    data: { leadId, type, metadata },
    select: { id: true },
  });
}

/** Existing LeadEvent metadata supports CRM entries without changing the database enum. */
import {cairoToday,readCrmEvent} from "@/lib/admin/lead-crm";
export async function latestLeadFollowups(ids?:string[]){
 if(ids&&ids.length===0)return [];
 const condition=ids?Prisma.sql`AND "leadId" IN (${Prisma.join(ids)})`:Prisma.empty;
 const rows=await prisma.$queryRaw<Array<{leadId:string;dueDate:string|null}>>(Prisma.sql`
 SELECT DISTINCT ON ("leadId") "leadId", metadata->>'dueDate' AS "dueDate"
 FROM "LeadEvent" WHERE metadata->>'crmKind' = 'followup' ${condition}
 ORDER BY "leadId", "createdAt" DESC, id DESC
 `);
 return rows;
}
export async function findFollowupLeadIds(filter:"due"|"today"|"overdue",today=cairoToday()){
 const comparator=filter==="today"?Prisma.sql`f."dueDate" = ${today}`:filter==="overdue"?Prisma.sql`f."dueDate" < ${today}`:Prisma.sql`f."dueDate" <= ${today}`;
 const rows=await prisma.$queryRaw<Array<{id:string}>>(Prisma.sql`
 SELECT l.id FROM "Lead" l JOIN (
 SELECT DISTINCT ON ("leadId") "leadId", metadata->>'dueDate' AS "dueDate" FROM "LeadEvent"
 WHERE metadata->>'crmKind'='followup' ORDER BY "leadId", "createdAt" DESC,id DESC
 ) f ON f."leadId"=l.id WHERE l.status IN ('NEW','CONTACTED','QUALIFIED') AND ${comparator}
 `);
 return rows.map(r=>r.id);
}
export async function getLeadCrmOverview(now=new Date()){
 const today=cairoToday(now);
 const [groups,due,overdue,unassigned]=await Promise.all([countLeadsByStatus(),findFollowupLeadIds("due",today),findFollowupLeadIds("overdue",today),prisma.lead.count({where:{assignedAdminId:null,status:{in:[LeadStatus.NEW,LeadStatus.CONTACTED,LeadStatus.QUALIFIED]}}})]);
 const counts=Object.fromEntries(Object.values(LeadStatus).map(status=>[status,groups.find(g=>g.status===status)?._count._all??0])) as Record<LeadStatus,number>;
 return {counts,due:due.length,overdue:overdue.length,unassigned,today};
}
export async function changeLeadStatusWithEvent(id:string,expected:LeadStatus,status:LeadStatus,type:Prisma.LeadEventCreateInput["type"],metadata:Prisma.InputJsonValue){
 return prisma.$transaction(async tx=>{const updated=await tx.lead.updateMany({where:{id,status:expected},data:{status}});if(updated.count!==1)throw new Error("تغيرت حالة العميل. أعد تحميل الصفحة.");await tx.leadEvent.create({data:{leadId:id,type,metadata}});return tx.lead.findUniqueOrThrow({where:{id},select:{id:true,status:true,name:true}});});
}
export async function writeLeadCrmEvent(id:string,metadata:Prisma.InputJsonValue){
 return prisma.$transaction(async tx=>{const lead=await tx.lead.findUnique({where:{id},select:{id:true,status:true}});if(!lead)throw new Error("الطلب غير موجود");if(metadata&&typeof metadata==="object"&&!Array.isArray(metadata)&&"crmKind" in metadata&&metadata.crmKind==="followup"&&!["NEW","CONTACTED","QUALIFIED"].includes(lead.status)&&metadata.dueDate!==null)throw new Error("لا يمكن جدولة متابعة لطلب مغلق");await tx.lead.update({where:{id},data:{updatedAt:new Date()}});await tx.leadEvent.create({data:{leadId:id,type:"STATUS_CHANGED",metadata}});return {id};},{isolationLevel:"Serializable"});
}
