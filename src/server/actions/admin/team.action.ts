"use server";
import {AdminRole} from "@/generated/prisma";
import {prisma} from "@/lib/db/prisma";
import {withAdminMutation} from "@/server/auth/admin-mutation";
import {hashPassword,verifyPassword} from "@/server/auth/password";
import {teamCreateSchema,teamMutationSchema,ownPasswordSchema} from "@/lib/validation/admin/team";
import {canManageTeamMember} from "@/lib/admin/roles";
import {revalidatePath} from "next/cache";
function refresh(){revalidatePath("/admin/users");revalidatePath("/admin");revalidatePath("/admin/audit");}
export async function createTeamMemberAction(raw:unknown){
 return withAdminMutation({minimumRole:AdminRole.OWNER},async actor=>{
 const input=teamCreateSchema.parse(raw);const passwordHash=await hashPassword(input.password);
 try{const result=await prisma.$transaction(async tx=>{
 const owner=await tx.adminUser.findUnique({where:{id:actor.id},select:{role:true,isActive:true,deletedAt:true}});
 if(!owner||owner.role!=="OWNER"||!owner.isActive||owner.deletedAt)throw new Error("ليس لديك صلاحية إدارة الفريق");
 const user=await tx.adminUser.create({data:{name:input.name,email:input.email,role:input.role,passwordHash},select:{id:true,role:true}});
 await tx.adminAuditLog.create({data:{adminUserId:actor.id,action:"team.create",entityType:"AdminUser",entityId:user.id,metadata:{role:user.role}}});
 return {id:user.id};},{isolationLevel:"Serializable"});refresh();return result;}catch(e){if(e&&typeof e==="object"&&"code" in e&&e.code==="P2002")throw new Error("البريد الإلكتروني مستخدم بالفعل");throw new Error("تعذر إنشاء الحساب. تحقق من البيانات أو حاول مرة أخرى.");}
 });
}
export async function updateTeamMemberAction(id:string,raw:unknown){
 return withAdminMutation({minimumRole:AdminRole.OWNER},async actor=>{
 const input=teamMutationSchema.parse(raw);const passwordHash=input.kind==="reset"?await hashPassword(input.password):undefined;
 const result=await prisma.$transaction(async tx=>{
 const [owner,target]=await Promise.all([tx.adminUser.findUnique({where:{id:actor.id},select:{id:true,role:true,isActive:true,deletedAt:true}}),tx.adminUser.findUnique({where:{id},select:{id:true,role:true,isActive:true,deletedAt:true}})]);
 if(!owner||!owner.isActive||owner.deletedAt||!target||!canManageTeamMember(owner,target))throw new Error("لا يمكن تعديل هذا الحساب");
 if(input.kind==="role"&&target.role===input.role||input.kind==="active"&&target.isActive===input.active)throw new Error("لا يوجد تغيير");
 const data=input.kind==="role"?{role:input.role}:input.kind==="active"?{isActive:input.active}:{passwordHash:passwordHash!};
 await tx.adminUser.update({where:{id},data});
 await tx.adminAuditLog.create({data:{adminUserId:actor.id,action:"team."+input.kind,entityType:"AdminUser",entityId:id,metadata:input.kind==="role"?{from:target.role,to:input.role}:input.kind==="active"?{active:input.active}:{reset:true}}});
 return {id};},{isolationLevel:"Serializable"});refresh();return result;
 });
}
export async function changeOwnPasswordAction(raw:unknown){
 return withAdminMutation({minimumRole:AdminRole.VIEWER},async actor=>{
 const input=ownPasswordSchema.parse(raw);
 const user=await prisma.adminUser.findUnique({where:{id:actor.id},select:{passwordHash:true,isActive:true,deletedAt:true}});
 if(!user||!user.isActive||user.deletedAt||!await verifyPassword(input.current,user.passwordHash))throw new Error("كلمة المرور الحالية غير صحيحة");
 const passwordHash=await hashPassword(input.password);
 await prisma.$transaction(async tx=>{
 const changed=await tx.adminUser.updateMany({where:{id:actor.id,passwordHash:user.passwordHash,isActive:true,deletedAt:null},data:{passwordHash}});
 if(changed.count!==1)throw new Error("تغيرت بيانات الحساب، سجّل الدخول مجددًا");
 await tx.adminAuditLog.create({data:{adminUserId:actor.id,action:"team.password_change",entityType:"AdminUser",entityId:actor.id,metadata:{changed:true}}});
 });return {id:actor.id};
 });
}
