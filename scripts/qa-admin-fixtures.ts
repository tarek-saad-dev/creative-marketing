import {prisma} from "../src/lib/db/client";
import {hash} from "bcryptjs";
import {writeFile} from "node:fs/promises";
async function main(){
 const url=new URL(process.env.DATABASE_URL??"");
 if(process.env.CI!=="true"||process.env.CM_QA_LOCAL_DATABASE!=="1"||url.hostname!=="127.0.0.1"||url.port!=="5432"||url.pathname!=="/cm_admin_qa")throw new Error("Refusing to seed non-QA database");
 const password=process.env.QA_PASSWORD;if(!password)throw new Error("Missing fixture credential");
 const passwordHash=await hash(password,12);
 for(const role of ["OWNER","ADMIN","EDITOR","VIEWER"] as const)await prisma.adminUser.create({data:{id:"qa-"+role.toLowerCase(),name:"QA "+role,email:role.toLowerCase()+"@example.test",passwordHash,role}});
 await prisma.lead.create({data:{id:"qa-lead",name:"QA Lead",phone:"01000000000",source:"isolated-qa",status:"NEW",projectName:"QA project"}});
 await prisma.project.create({data:{id:"qa-media-project",slug:"qa-media-project",title:"QA Media Project",summary:"Synthetic artwork for isolated tests",industry:"QA",coverImageUrl:"/qa-artwork.png",coverImageAlt:"QA artwork",status:"DRAFT",media:{create:{type:"IMAGE",url:"/qa-artwork.png",altText:"QA artwork",width:1,height:1}}}});
 await writeFile("public/qa-artwork.png",Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf5sAAAAASUVORK5CYII=","base64"));
 for(const name of ["a","b"])await writeFile("public/qa-batch-"+name+".png",Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf5sAAAAASUVORK5CYII=","base64"));
 await prisma.siteSetting.create({data:{key:"admin.media.library",value:["a","b"].map(name=>({url:"/qa-batch-"+name+".png",type:"IMAGE",name:"QA Batch "+name.toUpperCase(),altText:"",thumbnailUrl:"",width:1,height:1}))}});
 console.log("Isolated fixtures created");
}
main().catch(e=>{console.error(e instanceof Error?e.message:"Fixture setup failed");process.exitCode=1;}).finally(()=>prisma.$disconnect());
