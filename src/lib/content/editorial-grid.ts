/** Keep small collections prominent and avoid a single orphan in the last row.
 * Standard cards fill three columns; one/two remaining cards share the final row.
 */
export function editorialGridSpans(count:number):number[]{
  if(!Number.isSafeInteger(count)||count<=0)return [];
  if(count===1)return [6];
  if(count===2)return [3,3];
  const remainder=count%3;
  return Array.from({length:count},(_,index)=>{
    if(remainder===1&&index>=count-1)return 6;
    if(remainder===2&&index>=count-2)return 3;
    return 2;
  });
}
