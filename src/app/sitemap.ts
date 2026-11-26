import { niches } from "@/lib/content/niches";
import type { MetadataRoute } from "next";
import { getPublishedProjectSlugs } from "@/server/services/project.service";

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  let slugs: string[] = [];
  try {
    slugs = await getPublishedProjectSlugs();
  } catch {
    slugs = [];
  }

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...niches.map(niche => ({ url: siteUrl + niche.path, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...slugs.map(slug => ({
      url: `${siteUrl}/work/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
