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
