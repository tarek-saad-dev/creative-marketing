/** Unique, bounded neighbours in a circular project sequence. */
export function heroScenePositions(length:number,index:number){
  if(length<=0)return [];
  const center=((index%length)+length)%length;
  const offsets=length>=5?[-2,-1,0,1,2]:length===4?[-1,0,1,2]:length===3?[-1,0,1]:length===2?[0,1]:[0];
  return offsets.map(offset=>({offset,index:(center+offset+length)%length}));
}
