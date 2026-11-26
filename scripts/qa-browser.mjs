// Optional read-only Playwright run against an explicitly supplied deployment.
// Install for QA: npm install --no-save --package-lock=false playwright
// npx playwright install chromium
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const raw = process.argv[2] || process.env.QA_BASE_URL;
if (!raw) throw new Error("Provide public URL: npm run qa:browser -- https://your-site");
const base = new URL(raw);
assert.ok(["http:","https:"].includes(base.protocol));
const { chromium } = await import("playwright");
await mkdir("qa-artifacts",{recursive:true});
const browser = await chromium.launch({headless:true});
const failures = [];
try {
  for (const [name,width,height] of [["desktop",1440,900],["mobile",390,844],["small-mobile",320,700]]) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:"reduce",isMobile:name!=="desktop",hasTouch:name!=="desktop"});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    try {
      const response=await page.goto(base.origin,{waitUntil:"domcontentloaded",timeout:45000});
      assert.equal(response?.status(),200);
      await page.locator("#hero").waitFor();
      for(const id of ["work","services","packages","process","contact"]) assert.equal(await page.locator("#"+id).count(),1,"Missing/duplicate section: "+id);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
      assert.equal(overflow,false,"Horizontal document overflow");
      await page.screenshot({path:"qa-artifacts/"+name+".png",fullPage:true,animations:"disabled"});
      const serviceTabs=page.locator("#services [role=tab]");
      if(await serviceTabs.count()>1){
        await serviceTabs.nth(1).click();
        assert.equal(await serviceTabs.nth(1).getAttribute("aria-selected"),"true");
        await serviceTabs.nth(1).press("ArrowLeft");
        assert.equal(await serviceTabs.nth(2 % await serviceTabs.count()).getAttribute("aria-selected"),"true");
      }
      const media=page.locator("#creative-gallery button[aria-label^='فتح '], #work button[aria-label^='فتح ']");
      if(await media.count()){
        await media.first().click();
        await page.getByRole("dialog").waitFor({state:"visible"});
        await page.keyboard.press("Escape");
        await page.getByRole("dialog").waitFor({state:"hidden"});
      }
      assert.deepEqual(errors,[],"Uncaught client errors");
      console.log(name+": passed");
    } catch(error){failures.push(name+": "+error.message);await page.screenshot({path:"qa-artifacts/"+name+"-failure.png",animations:"disabled"}).catch(()=>{});}
    finally{await page.close();}
  }
} finally {await browser.close();}
assert.deepEqual(failures,[],"Browser QA failures");
