import { niches } from "@/lib/content/niches";
import type { MetadataRoute } from "next";
import { getPublishedProjectSlugs } from "@/server/services/project.service";

import {getPublicSeo} from "@/server/services/seo.service";
export const dynamic="force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {origin:siteUrl}=await getPublicSeo();

  let slugs: string[] = [];
  try {
    slugs = await getPublishedProjectSlugs();
  } catch {
    slugs = [];
  }

  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: siteUrl + "/work", changeFrequency: "weekly", priority: 0.9 },
    ...niches.map(niche => ({ url: siteUrl + niche.path, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...slugs.map(slug => ({
      url: `${siteUrl}/work/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
