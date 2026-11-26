/** Bound display frames to common creative sizes without cropping artwork. */
export function mediaAspectRatio(width: number | null | undefined, height: number | null | undefined, fallback = 1): number {
  if (typeof width !== "number" || typeof height !== "number" || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return fallback;
  return Math.max(9 / 16, Math.min(16 / 9, width / height));
}

export function planMediaMove<T extends { id: string; displayOrder: number }>(items: T[], mediaId: string, direction: -1 | 1) {
  const sorted = [...items].sort((a,b)=>a.displayOrder-b.displayOrder || a.id.localeCompare(b.id));
  const index = sorted.findIndex(item=>item.id===mediaId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= sorted.length) return [];
  [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
  return sorted.flatMap((item, displayOrder)=>item.displayOrder === displayOrder ? [] : [{id:item.id,displayOrder}]);
}

export function planMediaDrop<T extends {id:string;displayOrder:number}>(items:T[],mediaId:string,targetId:string){
  const sorted=[...items].sort((a,b)=>a.displayOrder-b.displayOrder||a.id.localeCompare(b.id));
  const source=sorted.findIndex(item=>item.id===mediaId),target=sorted.findIndex(item=>item.id===targetId);
  if(source<0||target<0||source===target)return [];
  const [item]=sorted.splice(source,1);sorted.splice(target,0,item);
  return sorted.flatMap((row,displayOrder)=>row.displayOrder===displayOrder?[]:[{id:row.id,displayOrder}]);
}
