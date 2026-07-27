import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import {
  getProjectBySlugForPreview,
  getPublishedProjectBySlug,
  getPublishedProjectSlugs,
  getRelatedPublishedProjects,
} from "@/server/services/project.service";
import { getAllSiteSettings } from "@/server/repositories/site-settings.repository";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { CaseStudyView } from "@/components/sections/case-study/case-study-view";
import { DraftPreviewBanner } from "@/components/preview/draft-preview-banner";
import { buildContactAndSocialLinks } from "@/components/sections/hero/hero-copy";
import { isUsableMediaUrl } from "@/lib/media/public-media";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedProjectSlugs();
    return slugs.map(slug => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const draft = await draftMode();
  const project = draft.isEnabled
    ? ((await getPublishedProjectBySlug(slug)) ??
      (await getProjectBySlugForPreview(slug)))
    : await getPublishedProjectBySlug(slug);

  if (!project) {
    return {
      title: "المشروع غير موجود",
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/work/${project.slug}`;
  const ogImages = isUsableMediaUrl(project.coverImageUrl)
    ? [
        {
          url: project.coverImageUrl.startsWith("http")
            ? project.coverImageUrl
            : `${siteUrl}${project.coverImageUrl}`,
          alt: project.coverImageAlt,
        },
      ]
    : undefined;

  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
    openGraph: {
      type: "article",
      title: `${project.title} | Creative Marketing`,
      description: project.summary,
      url: canonical,
      locale: "ar_SA",
      siteName: "Creative Marketing",
      images: ogImages,
    },
    twitter: {
      card: ogImages ? "summary_large_image" : "summary",
      title: project.title,
      description: project.summary,
      images: ogImages?.map(image => image.url),
    },
  };
}

export default async function WorkProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const draft = await draftMode();
  const project = draft.isEnabled
    ? ((await getPublishedProjectBySlug(slug)) ??
      (await getProjectBySlugForPreview(slug)))
    : await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const [related, settings] = await Promise.all([
    getRelatedPublishedProjects(project),
    getAllSiteSettings(),
  ]);

  const brandName = asString(settings["brand.name"], "Creative Marketing");
  const slogan = asString(
    settings["brand.slogan"],
    "WE THINK. WE CREATE. YOU GROW."
  );
  const { contactLinks, socialLinks } = buildContactAndSocialLinks(settings);

  return (
    <>
      {draft.isEnabled ? <DraftPreviewBanner path={`/work/${slug}`} /> : null}
      <a
        href="#case-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        تخطي إلى المحتوى
      </a>
      <MarketingHeader brandName={brandName} />
      <main id="case-main">
        <CaseStudyView project={project} related={related} />
      </main>
      <MarketingFooter
        brandName={brandName}
        slogan={slogan}
        contactLinks={contactLinks}
        socialLinks={socialLinks}
      />
    </>
  );
}
