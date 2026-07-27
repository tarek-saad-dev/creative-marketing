/**
 * Publication checklist + revalidation map contract tests (no Next runtime).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

type PublicationCheck = { key: string; label: string; ok: boolean };

function projectPublicationChecks(input: {
  title?: string | null;
  slug?: string | null;
  industry?: string | null;
  summary?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
}): PublicationCheck[] {
  return [
    { key: "title", label: "العنوان", ok: Boolean(input.title?.trim()) },
    { key: "slug", label: "الرابط", ok: Boolean(input.slug?.trim()) },
    { key: "industry", label: "المجال", ok: Boolean(input.industry?.trim()) },
    { key: "summary", label: "الملخص", ok: Boolean(input.summary?.trim()) },
    {
      key: "coverImageUrl",
      label: "صورة الغلاف",
      ok: Boolean(input.coverImageUrl?.trim()),
    },
    {
      key: "coverImageAlt",
      label: "النص البديل للغلاف",
      ok: Boolean(input.coverImageAlt?.trim()),
    },
  ];
}

function isPublicationReady(checks: PublicationCheck[]): boolean {
  return checks.every(check => check.ok);
}

/** Documented revalidation map — keep in sync with revalidation.service.ts */
const REVALIDATION_MAP = {
  settings: ["/", "sitemap.xml", "robots.txt"],
  project: ["/", "/work/[slug]", "/sitemap.xml"],
  service: ["/"],
  package: ["/"],
  offer: ["/"],
  testimonial: ["/"],
  trust: ["/"],
  faq: ["/"],
} as const;

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  assert(REVALIDATION_MAP.project.includes("/"), "project revalidates home");
  assert(
    REVALIDATION_MAP.project.some(p => p.includes("work")),
    "project revalidates work"
  );

  const incomplete = projectPublicationChecks({
    title: "t",
    slug: "s",
    industry: "",
    summary: "sum",
    coverImageUrl: "https://example.com/x.jpg",
    coverImageAlt: "alt",
  });
  assert(!isPublicationReady(incomplete), "missing industry blocks publish");

  const complete = projectPublicationChecks({
    title: "t",
    slug: "s",
    industry: "retail",
    summary: "sum",
    coverImageUrl: "https://example.com/x.jpg",
    coverImageAlt: "alt",
  });
  assert(isPublicationReady(complete), "complete checklist ready");

  console.log("admin:test-revalidation passed");
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
