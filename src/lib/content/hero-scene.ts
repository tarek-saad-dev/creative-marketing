import { isImageCandidate, isUsableMediaUrl, videoPoster } from "../media/public-media";
import { publicMediaCaption, type CreativeMedia } from "./creative-gallery";

/** Unique, bounded neighbours in a circular project sequence. */
export function heroScenePositions(length:number,index:number){
  if(length<=0)return [];
  const center=((index%length)+length)%length;
  const offsets=length>=5?[-2,-1,0,1,2]:length===4?[-1,0,1,2]:length===3?[-1,0,1]:length===2?[0,1]:[0];
  return offsets.map(offset=>({offset,index:(center+offset+length)%length}));
}

export type HeroMedia = CreativeMedia;
export function buildHeroMedia(project:{id:string;title:string;coverImageUrl:string|null;coverImageAlt:string|null},media:CreativeMedia[]):HeroMedia[]{
  const result:HeroMedia[]=[];
  const seen=new Set<string>();
  function add(item:HeroMedia){
    if(!isUsableMediaUrl(item.url)||seen.has(item.url)||(item.type==="IMAGE"&&!isImageCandidate(item.url)))return;
    seen.add(item.url);
    result.push({...item,altText:item.altText||project.title,caption:publicMediaCaption(item.caption)});
  }
  if(isImageCandidate(project.coverImageUrl)){
    const original=media.find(item=>item.type==="IMAGE"&&item.url===project.coverImageUrl);
    add(original??{id:"hero-cover-"+project.id,type:"IMAGE",url:project.coverImageUrl,thumbnailUrl:null,altText:project.coverImageAlt,caption:null,width:null,height:null});
  }
  for(const item of media)add(item);
  return result.slice(0,9);
}
export function heroMediaPoster(item:HeroMedia,cover?:string|null){
  return item.type==="VIDEO"?videoPoster(item.url,item.thumbnailUrl,cover):item.url;
}
export function heroExtraMedia(items:HeroMedia[],selected:number){
  const remaining=items.filter((item,index)=>index!==selected&&item.type==="IMAGE");
  const phone=remaining.find(item=>item.width&&item.height&&item.height>item.width)??remaining[0]??null;
  return {phone,panels:remaining.filter(item=>item.id!==phone?.id).slice(0,4)};
}
