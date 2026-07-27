import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Central cache-invalidation map for admin mutations.
 *
 * Public marketing routes (`/`, `/work/[slug]`) currently render with
 * `export const dynamic = "force-dynamic"`, so every request already reads
 * fresh data from Neon — these calls are a defensive no-op today and a
 * required safety net the moment any route opts into caching/ISR. Always
 * call the matching helper after a content mutation so behavior doesn't
 * silently regress if caching is (re)introduced later.
 *
 * | Mutation                          | Paths revalidated                      |
 * |------------------------------------|-----------------------------------------|
 * | Project create/update/publish     | `/`, `/work/[slug]`, `/sitemap.xml`     |
 * | Project archive/soft-delete       | `/`, `/work/[slug]`, `/sitemap.xml`     |
 * | Service create/update/archive     | `/`                                     |
 * | Package/feature mutation          | `/`                                     |
 * | Offer mutation                    | `/`                                     |
 * | Testimonial mutation              | `/`                                     |
 * | Trust metric / client logo        | `/`                                     |
 * | FAQ mutation                      | `/`                                     |
 * | Site setting mutation             | `/`, `/work/[slug]`                     |
 */
export function revalidateHomepage(): void {
  revalidatePath("/");
}

export function revalidateProject(slug?: string | null): void {
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/work/${slug}`);
  }
  revalidatePath("/sitemap.xml");
}

export function revalidateSitemap(): void {
  revalidatePath("/sitemap.xml");
}

/** Broad fallback for mutations touching settings shared across many pages. */
export function revalidateSiteWide(): void {
  revalidatePath("/", "layout");
}
