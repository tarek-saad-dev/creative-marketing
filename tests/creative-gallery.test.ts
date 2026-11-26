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
