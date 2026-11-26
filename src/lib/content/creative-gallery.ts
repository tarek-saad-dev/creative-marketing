import { isUsableMediaUrl } from "@/lib/media/public-media";

export type CreativeMedia = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};
export type CreativeGalleryProject = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  media: CreativeMedia[];
};
export type GalleryEntry = CreativeMedia & { projectTitle: string; slug: string; cover: string | null };
export type Comparison = { id: string; title: string; slug: string; before: CreativeMedia; after: CreativeMedia };

// Deliberately explicit: never infer before/after from upload order or aesthetics.
export function comparisonTag(caption: string | null) {
  const match = caption?.match(/^\s*\[(before|after):([a-z0-9-]{1,60})\]\s*/i);
  return match ? { side: match[1].toLowerCase() as "before" | "after", key: match[2].toLowerCase(), rest: caption!.slice(match[0].length).trim() } : null;
}
export function publicMediaCaption(caption: string | null) {
  const tag = comparisonTag(caption);
  return tag ? tag.rest || (tag.side === "before" ? "قبل" : "بعد") : caption;
}
function usable(url: string | null | undefined): url is string {
  return isUsableMediaUrl(url) && !url.startsWith("//");
}
export function buildCreativeGallery(projects: CreativeGalleryProject[]) {
  const comparisons: Comparison[] = [];
  const groups = projects.map(project => {
    const pairs = new Map<string, { before?: CreativeMedia; after?: CreativeMedia; invalid?: boolean }>();
    const seen = new Set<string>();
    const entries: GalleryEntry[] = [];
    for (const media of project.media) {
      if (!usable(media.url)) continue;
      const tag = comparisonTag(media.caption);
      if (tag && media.type === "IMAGE") {
        const pair = pairs.get(tag.key) ?? {};
        if (pair[tag.side]) pair.invalid = true;
        pair[tag.side] = media;
        pairs.set(tag.key, pair);
      }
      if (seen.has(media.url)) continue;
      seen.add(media.url);
      entries.push({ ...media, caption: publicMediaCaption(media.caption), projectTitle: project.title, slug: project.slug, cover: project.coverImageUrl });
    }
    if (usable(project.coverImageUrl) && !seen.has(project.coverImageUrl)) {
      entries.unshift({ id: "cover-" + project.id, type: "IMAGE", url: project.coverImageUrl, altText: project.coverImageAlt, caption: null, thumbnailUrl: null, width: null, height: null, projectTitle: project.title, slug: project.slug, cover: project.coverImageUrl });
    }
    for (const [key, pair] of pairs) {
      if (!pair.invalid && pair.before && pair.after && pair.before.url !== pair.after.url) comparisons.push({
        id: project.id + "-" + key, title: project.title, slug: project.slug,
        before: { ...pair.before, caption: publicMediaCaption(pair.before.caption) },
        after: { ...pair.after, caption: publicMediaCaption(pair.after.caption) },
      });
    }
    return entries;
  });
  // Round-robin avoids one project taking over the homepage feed.
  const entries: GalleryEntry[] = [];
  const max = Math.max(0, ...groups.map(group => group.length));
  for (let index = 0; index < max; index++) {
    for (const group of groups) if (group[index]) entries.push(group[index]);
  }
  return { entries, comparisons };
}
