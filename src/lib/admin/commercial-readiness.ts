import {hasValidConfiguredPrice} from "../validation/pricing";
export function packageMissingFields(input:{originalPrice?:{toString():string}|string|number|null;idealFor?:string|null;features:readonly unknown[]}){
 const missing:string[]=[];
 if(!hasValidConfiguredPrice(input.originalPrice))missing.push("سعر صالح أكبر من صفر");
 if(!input.idealFor?.trim())missing.push("مناسبة لـ");
 if(!input.features.length)missing.push("ميزة واحدة على الأقل");
 return missing;
}
export function mayEditPackage(status:string,commercial:boolean){return commercial||status==="DRAFT";}
export function mayChangePackageFeatureFlag(previous:boolean,next:boolean,commercial:boolean){return commercial||previous===next;}
