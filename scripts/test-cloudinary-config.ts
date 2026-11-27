/**
 * Default: configuration only. --live explicitly uploads disposable synthetic
 * files and destroys only the public IDs returned by those uploads.
 */
import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";
config({ path: ".env.local" });

const live=process.argv.includes("--live");
const videoIndex=process.argv.indexOf("--video");
const videoPath=videoIndex<0?undefined:process.argv[videoIndex+1];
const image=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jGZsAAAAASUVORK5CYII=","base64");
type Kind="image"|"video";

async function probe(cloudName:string,apiKey:string,secret:string,folder:string,kind:Kind,bytes:Buffer){
 const timestamp=Math.round(Date.now()/1000);
 const signature=cloudinary.utils.api_sign_request({timestamp,folder},secret);
 const fileName="cm-qa-"+randomUUID()+(kind==="image"?".png":".mp4");
 const body=new FormData();
 body.append("file",new Blob([new Uint8Array(bytes)],{type:kind==="image"?"image/png":"video/mp4"}),fileName);
 body.append("api_key",apiKey);body.append("timestamp",String(timestamp));body.append("signature",signature);body.append("folder",folder);
 let publicId:string|undefined;
 try{
  const response=await fetch("https://api.cloudinary.com/v1_1/"+encodeURIComponent(cloudName)+"/"+kind+"/upload",{method:"POST",body,signal:AbortSignal.timeout(90000)});
  if(!response.ok)throw new Error(kind+" upload HTTP "+response.status);
  const asset=await response.json() as {public_id?:string;secure_url?:string;resource_type?:string;bytes?:number;width?:number;height?:number};
  if(typeof asset.public_id!=="string"||!asset.public_id.startsWith(folder+"/"))throw new Error("Upload returned an unexpected public ID; inspect QA assets in Cloudinary");
  publicId=asset.public_id;
  if(asset.resource_type!==kind||!asset.secure_url||!asset.bytes||!asset.width||!asset.height)throw new Error("Upload response missing required metadata");
  const u=new URL(asset.secure_url);
  const segments=u.pathname.split("/").filter(Boolean);
  const folderParts=folder.split("/");
  if(u.protocol!=="https:"||u.hostname!=="res.cloudinary.com"||segments[0]!==cloudName||segments[1]!==kind||segments[2]!=="upload"||!/^v\d+$/.test(segments[3]??"")||folderParts.some((part,i)=>segments[i+4]!==part))throw new Error("Cloudinary delivery URL does not match CMS storage rules");
  const delivery=await fetch(u,{method:"GET",headers:{Range:"bytes=0-63"},signal:AbortSignal.timeout(30000)});
  if(!delivery.ok)throw new Error("Delivery HTTP "+delivery.status);
  await delivery.body?.cancel();
  console.log("PASS "+kind+" upload and delivery in "+folder.replace(/qa-[a-f0-9-]+/g,"qa-run"));
 }finally{
  if(publicId){
   const result=await cloudinary.uploader.destroy(publicId,{resource_type:kind,invalidate:true});
   if(result.result!=="ok"&&result.result!=="not found")throw new Error("QA asset cleanup not confirmed");
   console.log("PASS disposable "+kind+" cleanup");
  }
 }
}
async function main(){
 const cloudName=process.env.CLOUDINARY_CLOUD_NAME?.trim(),apiKey=process.env.CLOUDINARY_API_KEY?.trim(),secret=process.env.CLOUDINARY_API_SECRET?.trim();
 if(!cloudName||!apiKey||!secret){
  if(live)throw new Error("Cloudinary credentials missing; live upload cannot be verified");
  console.log("BLOCKED Cloudinary credentials missing — configuration probe only");return;
 }
 if(!/^[a-zA-Z0-9_-]+$/.test(cloudName))throw new Error("Invalid Cloudinary cloud name");
 cloudinary.config({cloud_name:cloudName,api_key:apiKey,api_secret:secret,secure:true});
 const signature=cloudinary.utils.api_sign_request({timestamp:Math.round(Date.now()/1000),folder:"creative-marketing/library"},secret);
 if(!signature)throw new Error("Failed to sign upload parameters");
 console.log("PASS signed configuration generated");
 if(!live){console.log("SKIP live upload; use --live to opt in");return;}
 if(videoIndex>=0&&(!videoPath||!videoPath.toLowerCase().endsWith(".mp4")))throw new Error("--video requires a local synthetic MP4 file");
 const video=videoPath?await readFile(videoPath):undefined;
 if(video&&(!video.length||video.length>100*1024*1024))throw new Error("Video must be nonempty and no larger than 100 MB");
 const runId="qa-"+randomUUID();
 const folders=["creative-marketing/library/"+runId,"creative-marketing/projects/"+runId];
 for(const folder of folders){
  await probe(cloudName,apiKey,secret,folder,"image",image);
  if(video)await probe(cloudName,apiKey,secret,folder,"video",video);
 }
 if(!video)console.log("SKIP video upload; pass --video with a synthetic MP4");
 console.log("PASS live Cloudinary checks; no CMS database writes performed");
}
main().catch(()=>{console.error("Cloudinary QA failed; inspect the last completed step and QA assets in the dashboard. No secrets printed.");process.exitCode=1;});
