import type { MetadataRoute } from "next";

import {getPublicSeo} from "@/server/services/seo.service";
export const dynamic="force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const {origin:siteUrl}=await getPublicSeo();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/preview/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
