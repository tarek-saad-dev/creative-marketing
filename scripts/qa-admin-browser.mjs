import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
if(process.env.CI!=="true"||process.env.CM_QA_LOCAL_DATABASE!=="1")throw new Error("CI only");
const db=new URL(process.env.DATABASE_URL??"");if(db.hostname!=="127.0.0.1"||db.pathname!=="/cm_admin_qa")throw new Error("Not a disposable database");
const base="http://127.0.0.1:3000",password=process.env.QA_PASSWORD;
assert.ok(password);
for(let i=0;i<90;i++){try{const r=await fetch(base+"/admin/login");if(r.ok)break;}catch{}if(i===89)throw new Error("App did not start");await new Promise(r=>setTimeout(r,1000));}
await mkdir("qa-admin-artifacts",{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
const contexts=[];
async function session(role,credential=password){const context=await browser.newContext({viewport:{width:1440,height:900}});contexts.push(context);const page=await context.newPage();page.setDefaultTimeout(20000);page.on("pageerror",e=>errors.push(role+": "+e.message));page.on("dialog",async d=>{if(d.type()==="alert")errors.push(role+": "+d.message());await d.accept();});await page.goto(base+"/admin/login");await page.locator("#email").fill(role+"@example.test");await page.locator("#password").fill(credential);await page.getByRole("button",{name:"تسجيل الدخول",exact:true}).click();await page.waitForURL(u=>u.pathname==="/admin");await page.locator("#admin-main h1").waitFor();return page;}
async function visit(page,path){const response=await page.goto(base+path,{waitUntil:"domcontentloaded"});assert.ok(response?.ok(),path+" HTTP "+response?.status());assert.equal(new URL(page.url()).pathname,path.split("?")[0],"Unexpected redirect: "+path);await page.locator("#admin-main h1").waitFor();assert.equal(await page.getByText("Application error: a server-side exception has occurred",{exact:false}).count(),0);assert.equal(await page.getByRole("heading",{name:"تعذر تحميل هذه الصفحة",exact:true}).count(),0,path+" error boundary");}
async function expectRedirect(page,path,target){await page.goto(base+path);await page.waitForURL(u=>u.pathname===target);}
async function overflow(page,path){const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(dimensions.scroll<=dimensions.client+2,path+" overflow "+JSON.stringify(dimensions));}
try{
 const guest=await browser.newContext();contexts.push(guest);
 for(const path of ["/admin","/admin/users","/admin/pages","/preview/homepage","/preview/homepage?version=1","/preview/project/qa-media-project"]){const response=await guest.request.get(base+path,{maxRedirects:0});assert.ok([302,303,307,308].includes(response.status()),path+" must require login");}
 const owner=await session("owner"),editor=await session("editor"),viewer=await session("viewer"),admin=await session("admin");
 const routes=["/admin","/admin/content","/admin/pages","/admin/projects","/admin/projects/new","/admin/projects/qa-media-project","/admin/media","/admin/portfolio","/admin/brand","/admin/content?section=services","/admin/content?section=packages","/admin/content?section=offers","/admin/content?section=testimonials","/admin/content?section=trust","/admin/content?section=logos","/admin/content?section=faqs","/admin/leads","/admin/leads/qa-lead","/admin/users","/admin/account","/admin/settings","/admin/audit"];
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:700}]){
  await owner.setViewportSize(viewport);
  for(const route of routes){await visit(owner,route);await overflow(owner,route);if(route==="/admin"){const contrast=await owner.locator("[data-admin-welcome-title]").evaluate(el=>{const luminance=color=>{const channels=color.match(/\d+(?:\.\d+)?/g).slice(0,3).map(v=>{const n=Number(v)/255;return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4;});return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;};const text=luminance(getComputedStyle(el).color),bg=luminance(getComputedStyle(el.parentElement).backgroundColor);return (Math.max(text,bg)+0.05)/(Math.min(text,bg)+0.05);});assert.ok(contrast>=4.5,"Admin welcome text contrast must be at least 4.5:1");}if(viewport.width!==320&&["/admin","/admin/pages","/admin/media","/admin/users","/admin/leads"].includes(route))await owner.screenshot({path:"qa-admin-artifacts/"+viewport.width+"-"+route.split("/").at(-1)+".png",fullPage:true,animations:"disabled"});}
  if(viewport.width<1024){await owner.getByRole("button",{name:"فتح القائمة"}).click();await owner.getByRole("dialog").getByRole("link",{name:"مركز المحتوى"}).click();await owner.waitForURL(u=>u.pathname==="/admin/content");assert.equal(await owner.getByRole("dialog").count(),0);}
 }
 console.log("PASS: 66 admin route/viewport checks and mobile navigation");
 await owner.setViewportSize({width:1440,height:900});
 await expectRedirect(viewer,"/admin/projects/new","/admin");await expectRedirect(viewer,"/admin/media","/admin");await expectRedirect(editor,"/admin/pages","/admin");await expectRedirect(admin,"/admin/users","/admin");
 await visit(viewer,"/admin/projects");assert.equal(await viewer.getByRole("link",{name:"إضافة مشروع"}).count(),0);
 await visit(editor,"/admin/projects/new");
 await editor.getByLabel("اسم المشروع",{exact:true}).fill("QA Draft Work");
 await editor.getByLabel("المجال",{exact:true}).fill("QA");
 await editor.getByLabel("وصف مختصر",{exact:true}).fill("Synthetic draft created by browser test");
 await editor.getByRole("button",{name:"حفظ المسودة وإضافة التصميمات"}).click();
 await editor.waitForURL(u=>/^\/admin\/projects\/[^/]+$/.test(u.pathname));
 const projectPath=new URL(editor.url()).pathname;
 await editor.getByRole("button",{name:"اختيار من المكتبة"}).last().click();
 await editor.getByRole("dialog").getByRole("button",{name:"اختيار QA Media Project",exact:true}).click();
 await editor.getByText("جاهزية النشر: مكتمل",{exact:false}).waitFor();
 await editor.getByRole("button",{name:"نشر",exact:true}).click();
 await editor.getByRole("button",{name:"معاينة التفاصيل",exact:true}).waitFor();
 await editor.getByRole("button",{name:"إلى مسودة",exact:true}).waitFor();
 console.log("PASS: role-specific access, project creation, media reuse and publication");
 // Verify a draft can be published but is not made live merely by saving.
 await visit(owner,"/admin/pages");
 const heroTitle=owner.getByLabel("العنوان",{exact:true});
 await heroTitle.fill("QA Homepage Headline");
 await owner.getByRole("button",{name:"حفظ مسودة",exact:true}).click();
 await owner.getByText("تم حفظ المسودة فقط.",{exact:true}).waitFor();
 let response=await guest.request.get(base+"/");assert.ok(response.ok());assert.ok(!(await response.text()).includes("QA Homepage Headline"),"Draft leaked publicly");
 await owner.getByRole("button",{name:"نشر",exact:true}).click();
 await owner.getByText("تم نشر الصفحة.",{exact:true}).waitFor();
 response=await guest.request.get(base+"/");assert.ok((await response.text()).includes("QA Homepage Headline"),"Published copy not visible");
 await owner.getByRole("button",{name:"استرجاع كمسودة",exact:true}).first().waitFor();
 const archivedHref=await owner.locator("a[href^=\"/preview/homepage?version=\"]").first().getAttribute("href");
 assert.ok(archivedHref,"Missing archived preview link");
 const historical=await owner.request.get(base+archivedHref);assert.ok(historical.ok());assert.ok(!(await historical.text()).includes("QA Homepage Headline"),"Archived preview shows wrong version");
 {
  await owner.getByRole("button",{name:"استرجاع كمسودة",exact:true}).first().click();await owner.getByText("تم استرجاع الإصدار كمسودة.",{exact:false}).waitFor();
  response=await guest.request.get(base+"/");assert.ok((await response.text()).includes("QA Homepage Headline"),"Restore changed live page before publish");
  await owner.getByRole("button",{name:"نشر",exact:true}).click();await owner.getByText("تم نشر الصفحة.",{exact:true}).waitFor();
  response=await guest.request.get(base+"/");assert.ok(!(await response.text()).includes("QA Homepage Headline"),"Restore was not published");
 }
 await visit(admin,"/admin/leads/qa-lead");
 await admin.getByRole("button",{name:"اليوم",exact:true}).click();
 await admin.getByRole("button",{name:"حفظ الموعد",exact:true}).click();
 await admin.getByText("تم تحديث موعد المتابعة.",{exact:true}).waitFor();
 await admin.getByLabel("نتيجة التواصل").fill("Synthetic contact note");
 await admin.getByRole("button",{name:"تسجيل في السجل"}).click();
 await admin.getByText("Synthetic contact note",{exact:true}).waitFor();
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  await admin.setViewportSize(viewport);
  await visit(admin,"/admin/leads?followup=due");
  const leadLink=admin.getByRole("link",{name:"QA Lead",exact:true});
  await leadLink.waitFor();assert.equal(await leadLink.count(),1,"Expected one accessible lead link per viewport");
  assert.equal(await leadLink.getAttribute("href"),"/admin/leads/qa-lead");
 }
 await admin.setViewportSize({width:1440,height:900});
 console.log("PASS: private archived preview, draft isolation, rollback and CRM follow-up/contact");
 // A live session must lose its write permissions when the owner changes its role.
 await visit(editor,projectPath);
 await visit(owner,"/admin/users");
 const editorCard=owner.locator("article").filter({hasText:"QA EDITOR"});
 await editorCard.getByLabel("دور QA EDITOR").selectOption("VIEWER");
 await editorCard.getByText("مشاهد",{exact:true}).filter({visible:true}).waitFor();
 await owner.waitForFunction(()=>Array.from(document.querySelectorAll("article")).some(a=>a.querySelector("h2")?.textContent==="QA EDITOR"&&a.querySelector("select")?.value==="VIEWER"&&!a.querySelector("select")?.disabled));
 await visit(owner,"/admin/users");
 assert.equal(await editorCard.getByLabel("دور QA EDITOR").inputValue(),"VIEWER","Role change must persist across reload");
 await editor.locator("input[name=url]").fill("/qa-artwork.png?stale=1");
 await editor.getByRole("button",{name:"إضافة من رابط",exact:true}).click();
 await editor.getByRole("alert").filter({hasText:"صلاحية"}).waitFor();
 await expectRedirect(editor,"/admin/projects/new","/admin");
 const viewerCard=owner.locator("article").filter({hasText:"QA VIEWER"});
 await viewerCard.getByRole("button",{name:"إيقاف الحساب",exact:true}).click();
 await viewerCard.getByRole("button",{name:"إعادة التفعيل",exact:true}).waitFor();
 await visit(owner,"/admin/users");
 await viewerCard.getByRole("button",{name:"إعادة التفعيل",exact:true}).waitFor();
 await expectRedirect(viewer,"/admin","/admin/login");
 console.log("PASS: stale write denied and suspended session blocked");
 await visit(owner,"/admin/users");
 const adminCard=owner.locator("article").filter({hasText:"QA ADMIN"});
 await adminCard.getByRole("button",{name:"كلمة المرور",exact:true}).click();
 const resetDialog=owner.getByRole("dialog");
 const newPassword="Qa!1"+randomBytes(16).toString("hex");
 await resetDialog.locator('input[type="password"]').fill(newPassword);
 await resetDialog.getByRole("button",{name:"تعيين كلمة المرور",exact:true}).click();
 await resetDialog.waitFor({state:"hidden"});
 await expectRedirect(admin,"/admin","/admin/login");
 const renewed=await session("admin",newPassword);await visit(renewed,"/admin/account");
 const ownPassword="Qa!2"+randomBytes(16).toString("hex");
 await renewed.getByLabel("الحالية",{exact:true}).fill(newPassword);
 await renewed.getByLabel("الجديدة",{exact:true}).fill(ownPassword);
 await renewed.getByLabel("تأكيد الجديدة",{exact:true}).fill(ownPassword);
 await renewed.getByRole("button",{name:"حفظ كلمة المرور",exact:true}).click();
 await renewed.getByText("تم التغيير. سجّل الدخول مرة أخرى بكلمة المرور الجديدة.",{exact:true}).waitFor();
 await expectRedirect(renewed,"/admin","/admin/login");
 const personal=await session("admin",ownPassword);await visit(personal,"/admin/account");
 console.log("PASS: personal password change revokes prior session and permits fresh login");
 console.log("PASS: password reset invalidates old session and new credentials work");
 assert.deepEqual(errors,[],"Browser runtime errors");
 console.log("Admin acceptance passed: protected routes, 3 viewport sizes, draft project, media reuse, homepage publication, CRM, live role, suspension and password reset");
}catch(e){for(const [i,context] of contexts.entries()){const pages=context.pages();if(pages.length)await pages[0].screenshot({path:"qa-admin-artifacts/failure-"+i+".png",fullPage:true}).catch(()=>{});}throw e;}finally{await browser.close();}
