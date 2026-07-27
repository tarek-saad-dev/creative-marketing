import type { ProjectImportManifest } from "./project-import.schema";

/**
 * VISIBLY NON-PRODUCTION EXAMPLE ONLY.
 * All items remain DRAFT. Do not run against Neon as real client work.
 * Labels intentionally include "EXAMPLE" / "PLACEHOLDER".
 */
export const projectImportExample: ProjectImportManifest = {
  forceOverwrite: false,
  projects: [
    {
      slug: "example-placeholder-brand-system",
      title: "[EXAMPLE] Placeholder Brand System",
      clientName: "[PLACEHOLDER CLIENT — NOT REAL]",
      industry: "Demo",
      summary:
        "This is a non-production example row for validating the import schema only. It must never be published as client work.",
      challenge: "Example challenge text for schema testing. Not a real brief.",
      solution:
        "Example solution text for schema testing. Not a real delivery.",
      duration: null,
      resultText: null,
      coverImageUrl: "/projects/example-placeholder-cover.webp",
      coverImageAlt: "Example placeholder cover — not real client work",
      featured: false,
      status: "DRAFT",
      displayOrder: 999,
      publishedAt: null,
      serviceSlugs: ["build-visual-identity"],
      media: [
        {
          type: "IMAGE",
          url: "/projects/example-placeholder-cover.webp",
          altText: "Example placeholder gallery image",
          displayOrder: 0,
        },
      ],
    },
  ],
};
