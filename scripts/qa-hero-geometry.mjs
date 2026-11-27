// Real Chromium geometry regression using the production hero stylesheet.
// Synthetic frames only: no network, customer content or database.
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {chromium} from "playwright";
const css=await readFile(new URL("../src/components/sections/work/immersive-showcase.module.css",import.meta.url),"utf8");
const browser=await chromium.launch({headless:true});
let count=0;
const failures=[];
try{
  for(const [viewport,width,height] of [[1920,1120,690],[1440,840,608],[1366,810,476],[1024,600,476],[768,700,422],[390,364,246],[320,294,205]]){
    const page=await browser.newPage({viewport:{width:viewport,height:900},reducedMotion:"no-preference"});
    for(const offsets of [[0],[0,1],[-1,0,1],[-1,0,1,2],[-2,-1,0,1,2],[-1,0],[-2,-1,0,1]]){
      for(const phone of [false,true]){
        const markup=offsets.map(offset=>'<div class="scenePanel" data-offset="'+offset+'"></div>').join("")+(phone?'<div class="scenePhone"></div>':'');
        await page.setContent('<style>*{box-sizing:border-box}body{margin:0}'+css+' .fixture .stage{margin:0}.fixture .sceneRig,.fixture .scenePanel{transition:none!important}</style><div class="hero fixture" style="padding:0;min-height:0;display:block"><div class="stage" data-count="'+offsets.length+'" data-phone="'+phone+'" style="width:'+width+'px;height:'+height+'px"><div class="sceneRig">'+markup+'</div></div></div>');
        for(const [x,y] of [[0,0],[1.5,2],[-1.5,-2]]){
          const issues=await page.evaluate(([x,y])=>{
            const rig=document.querySelector(".sceneRig");
            rig.style.setProperty("--scene-x",x+"deg");
            rig.style.setProperty("--scene-y",y+"deg");
            const stage=document.querySelector(".stage").getBoundingClientRect();
            const main=document.querySelector('[data-offset="0"]').getBoundingClientRect();
            return [...document.querySelectorAll(".scenePanel,.scenePhone")].filter(node=>getComputedStyle(node).display!=="none").flatMap(node=>{
              const r=node.getBoundingClientRect();
              const clipped=r.left<stage.left-2||r.top<stage.top-2||r.right>stage.right+2||r.bottom>stage.bottom+2;
              const overlaps=node.dataset.offset!=="0"&&Math.min(r.right,main.right)-Math.max(r.left,main.left)>3&&Math.min(r.bottom,main.bottom)-Math.max(r.top,main.top)>3;
              return clipped||overlaps?[{id:node.dataset.offset??"phone",clipped,overlaps}]:[];
            });
          },[x,y]);
          count++;
          if(issues.length)failures.push({viewport,offsets,phone,x,y,issues});
        }
      }
    }
    await page.close();
  }
}finally{await browser.close();}
assert.deepEqual(failures,[],"Hero objects must fit the stage without covering the central artwork");
console.log(count+" hero geometry cases passed");
