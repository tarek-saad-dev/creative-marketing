import test from "node:test";
import assert from "node:assert/strict";
import { buildCreativeGallery, comparisonTag, publicMediaCaption, type CreativeMedia, type CreativeGalleryProject } from "../src/lib/content/creative-gallery";
import { buildContactAndSocialLinks } from "../src/components/sections/hero/hero-copy";
import { marketingNavItems } from "../src/components/layout/nav-config";

function media(id: string, caption: string | null = null, type: "IMAGE" | "VIDEO" = "IMAGE", url = "/test/" + id + ".jpg"): CreativeMedia {
  return { id, caption, type, url, thumbnailUrl: null, altText: id, width: 100, height: 100 };
}
function project(id: string, items: CreativeMedia[]): CreativeGalleryProject {
  return { id, slug: id, title: id, coverImageUrl: "/test/" + id + "-cover.jpg", coverImageAlt: id, media: items };
}
test("explicit markers match regardless of ordering and preserve public captions", () => {
  const result = buildCreativeGallery([project("a", [media("new", "[after:logo] New"), media("old", "[before:logo] Old")])]);
  assert.equal(result.comparisons.length, 1);
  assert.equal(result.comparisons[0].before.id, "old");
  assert.equal(result.comparisons[0].after.caption, "New");
  assert.equal(publicMediaCaption("[before:logo]"), "قبل");
  assert.equal(comparisonTag("[before:bad key]"), null);
});
test("no cross-project pairs, duplicate sides, video pairs or identical image comparisons", () => {
  const a = project("a", [media("1", "[before:x]"), media("2", "[before:x]"), media("3", "[after:x]"), media("4", "[before:y]"), media("5", "[after:z]", "VIDEO"), media("6", "[before:z]"), media("7", "[before:same]", "IMAGE", "/same.jpg"), media("8", "[after:same]", "IMAGE", "/same.jpg")]);
  const b = project("b", [media("9", "[after:y]")]);
  assert.equal(buildCreativeGallery([a,b]).comparisons.length, 0);
});
test("feed interleaves projects, rejects unsafe URLs and deduplicates each project", () => {
  const a = project("a", [media("1"), media("duplicate", null, "IMAGE", "/test/1.jpg"), media("bad", null, "IMAGE", "javascript:alert(1)"), media("bad2", null, "IMAGE", "//bad.example/x")]);
  const b = project("b", [media("2")]);
  const result = buildCreativeGallery([a,b]);
  assert.deepEqual(result.entries.map(item => item.id), ["cover-a","cover-b","1","2"]);
});
test("navigation anchors are canonical homepage links", () => {
  assert.deepEqual(marketingNavItems.map(item => item.href), ["/#work","/#services","/#industries","/#packages","/#process"]);
});
test("public social links allow HTTPS only", () => {
  const result = buildContactAndSocialLinks({"brand.instagram":"https://example.com/studio","brand.facebook":"javascript:alert(1)","brand.behance":"http://example.com"});
  assert.equal(result.socialLinks.length, 1);
  assert.equal(result.socialLinks[0].label, "Instagram");
});

import { niches, matchesNiche, nicheForSource } from "../src/lib/content/niches";
test("niche lead context and industry matching remain explicit", () => {
  assert.equal(nicheForSource("niche_teachers_books:hero")?.slug,"teachers-books");
  assert.equal(nicheForSource("niche_teachers:mobile")?.slug,"teachers");
  assert.equal(nicheForSource("niche_unknown"),undefined);
  assert.equal(matchesNiche(niches[0],{industry:"Barber shop",services:[]}),true);
  assert.equal(matchesNiche(niches[0],{industry:"Hotel",services:[]}),false);
});

import { isUsableMediaUrl, isImageCandidate, videoPoster } from "../src/lib/media/public-media";
test("invalid media schemes and video posters are handled",()=>{
  assert.equal(isUsableMediaUrl("//example.com/image.jpg"),false);
  assert.equal(isUsableMediaUrl("javascript:alert(1)"),false);
  assert.equal(isImageCandidate("https://example.com/movie.mp4"),false);
  assert.equal(videoPoster("https://example.com/movie.mp4","https://example.com/movie.mp4","/cover.jpg"),"/cover.jpg");
  assert.equal(videoPoster("https://res.cloudinary.com/demo/video/upload/v1/clip.mp4"),"https://res.cloudinary.com/demo/video/upload/v1/clip.jpg");
});

import { mediaAspectRatio, planMediaMove } from "../src/lib/media/portfolio-layout";
test("empty, cover-only and large galleries remain stable",()=>{
  assert.deepEqual(buildCreativeGallery([]),{entries:[],comparisons:[]});
  assert.equal(buildCreativeGallery([project("single",[])]).entries.length,1);
  const projects=Array.from({length:40},(_,i)=>project("p"+i,Array.from({length:20},(_,j)=>media(i+"-"+j,null,j%3===0?"VIDEO":"IMAGE"))));
  const result=buildCreativeGallery(projects);
  assert.equal(result.entries.length,840);
  assert.equal(new Set(result.entries.map(entry=>entry.id)).size,840);
  assert.deepEqual(result.entries.slice(0,40).map(entry=>entry.slug),projects.map(p=>p.slug));
});
test("common media ratios remain proportional and pathological sizes are bounded",()=>{
  assert.equal(mediaAspectRatio(1080,1080),1);
  assert.equal(mediaAspectRatio(1080,1350),4/5);
  assert.equal(mediaAspectRatio(1080,1920),9/16);
  assert.equal(mediaAspectRatio(1920,1080),16/9);
  assert.equal(mediaAspectRatio(0,1920),1);
  assert.equal(mediaAspectRatio(Infinity,1),1);
  assert.equal(mediaAspectRatio(null,null,4/3),4/3);
  assert.equal(mediaAspectRatio(10000,1),16/9);
});
test("reorder handles ties, gaps, bounds and does not mutate source",()=>{
  const source=[{id:"b",displayOrder:4},{id:"a",displayOrder:4},{id:"c",displayOrder:9}];
  assert.deepEqual(planMediaMove(source,"a",1),[{id:"b",displayOrder:0},{id:"a",displayOrder:1},{id:"c",displayOrder:2}]);
  assert.deepEqual(planMediaMove(source,"a",-1),[]);
  assert.deepEqual(planMediaMove(source,"missing",1),[]);
  assert.equal(source[0].displayOrder,4);
});

import { defaultPortfolioSettings, readPortfolioSettings, selectPortfolioProjects } from "../src/lib/content/portfolio-settings";
import { planMediaDrop } from "../src/lib/media/portfolio-layout";
test("manual portfolio order skips unavailable projects and respects disabled slots",()=>{
  const settings=defaultPortfolioSettings();
  const projects=[{id:"a",primaryMediaType:"IMAGE"},{id:"b",primaryMediaType:"VIDEO",primaryMediaUrl:"/b.mp4"},{id:"c",primaryMediaType:"IMAGE"}];
  settings.hero.ids=["c","removed","a","c"];
  assert.deepEqual(selectPortfolioProjects(projects,settings,"hero").map(p=>p.id),["c","a"]);
  assert.deepEqual(selectPortfolioProjects(projects,settings,"reel").map(p=>p.id),["b"]);
  settings.device.enabled=false;
  assert.deepEqual(selectPortfolioProjects(projects,settings,"device"),[]);
  assert.deepEqual(readPortfolioSettings({invalid:true}),defaultPortfolioSettings());
});
test("drag ordering moves to target index and never mutates input",()=>{
  const source=[{id:"a",displayOrder:0},{id:"b",displayOrder:1},{id:"c",displayOrder:2}];
  assert.deepEqual(planMediaDrop(source,"a","c"),[{id:"b",displayOrder:0},{id:"c",displayOrder:1},{id:"a",displayOrder:2}]);
  assert.deepEqual(planMediaDrop(source,"a","unknown"),[]);
  assert.equal(source[0].id,"a");
});

import { heroScenePositions } from "../src/lib/content/hero-scene";
import { buildHeroCopy } from "../src/components/sections/hero/hero-copy";
test("hero scene shows at most five unique projects across empty, small and large selections",()=>{
  for(let n=0;n<=20;n++)for(let index=0;index<Math.max(n,1);index++){
    const slots=heroScenePositions(n,index);
    assert.equal(slots.length,Math.min(n,5));
    assert.equal(new Set(slots.map(s=>s.index)).size,slots.length);
    if(n)assert.equal(slots.find(s=>s.offset===0)?.index,index);
  }
});
test("hero copy shortens legacy default but preserves customized text",()=>{
  const base={hasActiveOffer:false,hasPublishedPrices:false};
  assert.equal(buildHeroCopy({...base,settings:{}}).title,"إبداع يلفت النظر.\nوبراند يكبر.");
  assert.equal(buildHeroCopy({...base,settings:{"landing.hero.title":"عنوان مخصص"}}).title,"عنوان مخصص");
});

import { buildHeroMedia, heroExtraMedia, heroMediaPoster } from "../src/lib/content/hero-scene";
test("hero uses cover first, deduplicates uploads and keeps only usable bounded media",()=>{
  const p=project("hero",[]);
  const cover={...media("cover"),url:p.coverImageUrl!,width:1080,height:1350};
  const portrait={...media("portrait"),width:1080,height:1920};
  const video=media("clip",null,"VIDEO","/clip.mp4");
  const items=buildHeroMedia(p,[portrait,cover,video,media("invalid",null,"IMAGE","/movie.mp4"),media("dup",null,"IMAGE",portrait.url),...Array.from({length:15},(_,i)=>media("h"+i))]);
  assert.equal(items[0].id,"cover");
  assert.equal(items.length,9);
  assert.equal(new Set(items.map(x=>x.url)).size,9);
  assert.equal(items.some(x=>x.id==="invalid"),false);
  assert.equal(heroExtraMedia(items,0).phone?.id,"portrait");
  assert.equal(heroMediaPoster(video,p.coverImageUrl),p.coverImageUrl);
});
test("hero extra media never repeats the active image or phone",()=>{
  const p=project("one",[]);
  const list=buildHeroMedia(p,[media("a"),media("b"),media("c")]);
  const extra=heroExtraMedia(list,1);
  assert.notEqual(extra.phone?.id,list[1].id);
  assert.ok(extra.panels.every(item=>item.id!==list[1].id&&item.id!==extra.phone?.id));
  assert.equal(buildHeroMedia(p,[]).length,1);
});

import { resolveMockupStyle } from "../src/lib/content/mockup-style";
test("adaptive mockups use explicit service evidence and preserve manual overrides",()=>{
  assert.equal(resolveMockupStyle({services:[{nameEn:"Teachers Books"}]}),"book");
  assert.equal(resolveMockupStyle({services:[{nameAr:"هوية بصرية"}]}),"brand");
  assert.equal(resolveMockupStyle({services:[{slug:"social-media"}]}),"social");
  assert.equal(resolveMockupStyle({services:[]},"auto","VIDEO"),"screen");
  assert.equal(resolveMockupStyle({services:[{nameEn:"Brand Identity"}]},"plain","VIDEO"),"plain");
  assert.equal(resolveMockupStyle({services:[]}),"plain");
  assert.equal(resolveMockupStyle(undefined,"auto",undefined,"book"),"book");
});
test("older portfolio settings gain mockup defaults without losing selections",()=>{
  const settings=defaultPortfolioSettings();settings.hero.ids=["kept"];const {mockups,...old}=settings;
  assert.deepEqual(readPortfolioSettings(old).hero.ids,["kept"]);
  assert.deepEqual(readPortfolioSettings(old).mockups,{});
  assert.deepEqual(readPortfolioSettings({...old,mockups:{kept:"book"}}).mockups,{kept:"book"});
});

import { readBrandAssets, brandAssetsSchema, defaultBrandAssets } from "../src/lib/content/brand-assets";
test("brand assets reject unsafe URLs and preserve safe fallback",()=>{const initial=defaultBrandAssets();assert.deepEqual(readBrandAssets(null),initial);assert.equal(brandAssetsSchema.safeParse({...initial,headerLogo:"javascript:alert(1)"}).success,false);assert.equal(brandAssetsSchema.safeParse({...initial,headerLogo:"//example.com/logo.png"}).success,false);assert.equal(brandAssetsSchema.safeParse({...initial,headerLogo:"https://example.com/logo.png"}).success,true);assert.equal(brandAssetsSchema.safeParse({...initial,headerLogo:"/brand/logo.svg"}).success,true);});

import {projectDraftSlug,projectPublishChecklist} from "../src/lib/content/project-publishing";
test("quick draft slugs support Arabic and distinguish identical titles",()=>{assert.equal(projectDraftSlug("حملة ديسمبر","abc123"),"project-abc123");assert.equal(projectDraftSlug("Brand Identity","abc123"),"brand-identity-abc123");assert.notEqual(projectDraftSlug("حملة ديسمبر","a"),projectDraftSlug("حملة ديسمبر","b"));});
test("publish readiness uses identical checks for draft UI and server",()=>{const project={title:"Test",slug:"test",summary:"Summary",industry:"Education",coverImageUrl:"/cover.jpg",coverImageAlt:"Cover"};assert.ok(projectPublishChecklist(project).every(i=>i.ok));assert.equal(projectPublishChecklist({...project,coverImageUrl:"/movie.mp4"}).filter(i=>!i.ok).length,1);assert.equal(projectPublishChecklist({...project,summary:" "}).filter(i=>!i.ok).length,1);});

import {minimalHeroPositions} from "../src/lib/content/hero-scene";
test("minimal hero selects no more than three unique projects",()=>{for(let n=0;n<=20;n++)for(let i=0;i<Math.max(1,n);i++){const slots=minimalHeroPositions(n,i);assert.equal(slots.length,Math.min(n,3));assert.equal(new Set(slots.map(s=>s.index)).size,slots.length);assert.ok(slots.every(s=>Math.abs(s.offset)<=1));}});

import {editorialGridSpans} from "../src/lib/content/editorial-grid";
test("editorial work grid fills every desktop row for small and large collections",()=>{assert.deepEqual(editorialGridSpans(0),[]);assert.deepEqual(editorialGridSpans(1),[6]);assert.deepEqual(editorialGridSpans(2),[3,3]);for(let n=1;n<=120;n++){const spans=editorialGridSpans(n);assert.equal(spans.length,n);let used=0;for(const span of spans){used+=span;assert.ok(used<=6);if(used===6)used=0;}assert.equal(used,0);}});
