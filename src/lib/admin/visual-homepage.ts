import type {HomeSectionId} from "../content/homepage-editor";
import {websiteSectionHref} from "./website-workspace";
type Action={label:string;href:string};
export function visualSectionActions(id:HomeSectionId):Action[]{return [{label:id==="industries"?"تعديل المجالات والصور":"تعديل هذا القسم",href:websiteSectionHref(id)}];}
