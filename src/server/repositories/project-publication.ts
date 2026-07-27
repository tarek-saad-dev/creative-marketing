import "server-only";

import type { Prisma } from "@/generated/prisma";
import { ContentStatus } from "@/generated/prisma";

/**
 * Shared public publication filter for Project queries.
 * Incomplete covers/text and future publish dates never appear publicly.
 */
export function publishedProjectWhere(
  now: Date = new Date()
): Prisma.ProjectWhereInput {
  return {
    deletedAt: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: { not: null, lte: now },
    AND: [
      { slug: { not: "" } },
      { title: { not: "" } },
      { summary: { not: "" } },
      { coverImageUrl: { not: null } },
      { coverImageUrl: { not: "" } },
      { coverImageAlt: { not: null } },
      { coverImageAlt: { not: "" } },
    ],
  };
}

export function featuredPublishedProjectWhere(
  now: Date = new Date()
): Prisma.ProjectWhereInput {
  return {
    ...publishedProjectWhere(now),
    featured: true,
  };
}

export const publishedProjectOrderBy: Prisma.ProjectOrderByWithRelationInput[] =
  [{ displayOrder: "asc" }, { publishedAt: "desc" }, { id: "asc" }];

/** Card select — no full gallery (first media type only via take:1). */
export const projectCardSelect = {
  id: true,
  slug: true,
  title: true,
  clientName: true,
  industry: true,
  summary: true,
  coverImageUrl: true,
  coverImageAlt: true,
  resultText: true,
  duration: true,
  featured: true,
  displayOrder: true,
  publishedAt: true,
  media: {
    orderBy: { displayOrder: "asc" as const },
    take: 1,
    select: {
      type: true,
      url: true,
      thumbnailUrl: true,
    },
  },
  projectServices: {
    select: {
      service: {
        select: {
          id: true,
          slug: true,
          nameAr: true,
          nameEn: true,
          category: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectSelect;

export const projectDetailSelect = {
  id: true,
  slug: true,
  title: true,
  clientName: true,
  industry: true,
  summary: true,
  challenge: true,
  solution: true,
  duration: true,
  resultText: true,
  coverImageUrl: true,
  coverImageAlt: true,
  featured: true,
  displayOrder: true,
  publishedAt: true,
  media: {
    orderBy: { displayOrder: "asc" as const },
    select: {
      id: true,
      type: true,
      url: true,
      thumbnailUrl: true,
      altText: true,
      caption: true,
      width: true,
      height: true,
      displayOrder: true,
    },
  },
  projectServices: {
    select: {
      service: {
        select: {
          id: true,
          slug: true,
          nameAr: true,
          nameEn: true,
          category: true,
          summaryAr: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectSelect;
