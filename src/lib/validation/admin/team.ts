import {z} from "zod";
import {teamAssignableRoles} from "../../admin/roles";
export const teamRoleSchema=z.enum(teamAssignableRoles);
export const teamPasswordSchema=z.string().min(12,"كلمة المرور 12 حرفًا على الأقل").max(72).refine(v=>new TextEncoder().encode(v).length<=72,"كلمة المرور لا تتجاوز 72 بايت").refine(v=>/[A-Z]/.test(v)&&/[a-z]/.test(v)&&/[0-9]/.test(v)&&/[^A-Za-z0-9]/.test(v),"استخدم حروفًا كبيرة وصغيرة وأرقامًا ورموزًا");
export const teamCreateSchema=z.object({name:z.string().trim().min(2).max(120),email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),role:teamRoleSchema,password:teamPasswordSchema});
export const teamMutationSchema=z.discriminatedUnion("kind",[z.object({kind:z.literal("role"),role:teamRoleSchema}),z.object({kind:z.literal("active"),active:z.boolean()}),z.object({kind:z.literal("reset"),password:teamPasswordSchema})]);
export const ownPasswordSchema=z.object({current:z.string().min(1).max(256),password:teamPasswordSchema}).refine(v=>v.current!==v.password,{message:"اختر كلمة مرور مختلفة",path:["password"]});
