import {z} from "zod";
import {PROCESS_STEPS} from "./process-steps";
const step=z.object({title:z.string().trim().min(1).max(80),description:z.string().trim().min(1).max(350)});
const word=z.string().trim().min(1).max(24);
export const processStepsSchema=z.array(step).length(5);
export const bridgeWordsSchema=z.object({bridge1:z.array(word).length(4),bridge2:z.array(word).length(3)});
export type EditableProcessSteps=z.infer<typeof processStepsSchema>;
export type EditableBridgeWords=z.infer<typeof bridgeWordsSchema>;
export function defaultProcessSteps():EditableProcessSteps{return PROCESS_STEPS.map(({title,description})=>({title,description}));}
export function defaultBridgeWords():EditableBridgeWords{return {bridge1:["THINK.","CREATE.","BUILD.","GROW."],bridge2:["IDEAS.","DESIGN.","IMPACT."]};}
export function extraHomeChanges(a:{processSteps:EditableProcessSteps;bridgeWords:EditableBridgeWords},b:{processSteps:EditableProcessSteps;bridgeWords:EditableBridgeWords}){
 const changes:Array<{key:string;before:string;after:string}>=[];
 function compare(key:string,before:string,after:string){if(before!==after)changes.push({key,before,after});}
 for(let i=0;i<5;i++){compare("طريقة العمل / عنوان الخطوة "+(i+1),a.processSteps[i].title,b.processSteps[i].title);compare("طريقة العمل / وصف الخطوة "+(i+1),a.processSteps[i].description,b.processSteps[i].description);}
 for(const id of ["bridge1","bridge2"] as const)for(let i=0;i<a.bridgeWords[id].length;i++)compare((id==="bridge1"?"الفاصل الأول":"الفاصل الثاني")+" / كلمة "+(i+1),a.bridgeWords[id][i],b.bridgeWords[id][i]);
 return changes;
}
