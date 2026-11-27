import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
/** Opaque session binding, not a password hash or an authentication token. */
export function credentialVersion(passwordHash:string){
 const secret=process.env.AUTH_SECRET??process.env.NEXTAUTH_SECRET;
 if(!secret)throw new Error("Auth secret is required");
 return createHmac("sha256",secret).update("cm-admin-credential-v1:").update(passwordHash).digest("hex");
}
export function matchesCredentialVersion(version:unknown,passwordHash:string){
 if(typeof version!=="string"||! /^[a-f0-9]{64}$/.test(version))return false;
 return timingSafeEqual(Buffer.from(version,"hex"),Buffer.from(credentialVersion(passwordHash),"hex"));
}
