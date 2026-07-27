# Phase 3 — Portfolio & Services Visual Audit

**Date:** 2026-07-21  
**Scope:** Pre-implementation audit only (no fake projects introduced).

## Current project-data capabilities

| Capability                                           | Status                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Project` / `ProjectMedia` / `ProjectService` models | Present in Prisma                                                                                |
| `findFeaturedPublishedProjects()`                    | Exists — thin filter (`featured` + `PUBLISHED` + `deletedAt`)                                    |
| Cover / summary completeness guard                   | **Missing**                                                                                      |
| `publishedAt` not-in-future guard                    | **Missing**                                                                                      |
| By-slug public detail                                | **Missing**                                                                                      |
| Related projects                                     | **Missing**                                                                                      |
| Public slug list / static params                     | **Missing**                                                                                      |
| Landing DTO featured fields                          | id, slug, title, summary, cover, industry, order — **no services, result, duration, media type** |
| Media loaded in repo then dropped in service         | Wasteful; cards should not load full galleries                                                   |

## Real content available

- **Published featured projects:** expected **0** (seed intentionally skips projects).
- **Active services:** 16 seeded across THINK / CREATE / BUILD / GROW.
- **`public/projects/`:** empty (`.gitkeep` only).
- **Official portfolio media:** none in repo.

## Missing repository / service methods

- Shared `publishedProjectWhere` publication helper
- `findFeaturedPublishedProjects` (hardened, card-shaped select)
- `findPublishedProjectBySlug`
- `findPublishedProjectSlugs`
- `findRelatedPublishedProjects`
- Service ecosystem enrichment (category meta + optional real project preview)
- Project detail service (`getPublishedProjectBySlug`, related)

## Assets found

- Brand / hero placeholder READMEs
- No cover images, videos, or OG assets for projects

## Routing options considered

1. **Canonical `/work/[slug]` + intercepting modal from home** — powerful UX, higher App Router complexity with current `(marketing)` group.
2. **Canonical `/work/[slug]` cinematic page only** — maintainable, shareable, no fragile parallel routes.

**Decision:** Option 2 for Phase 3. Direct case-study pages with marketing chrome. Modal/intercept deferred unless a clean parallel-route layout is introduced later without destabilizing the marketing page.

## Client / server boundaries (proposed)

| Layer                                                 | Rendering               |
| ----------------------------------------------------- | ----------------------- |
| Work section, Services section, case-study page shell | Server Components       |
| Card hover polish, video preview, lightbox            | Small Client Components |
| Prisma / repositories                                 | `server-only`           |

## Performance risks

- Loading full `media[]` for every featured card (current repo)
- Autoplaying multiple videos
- Missing `sizes` / CLS on covers
- Serializing full Prisma graphs to the client

## Accessibility risks

- Hover-only metadata
- Video without reduced-motion / pause-offscreen
- Modal focus (if added later)
- Empty optional fields rendering empty labels

## Proposed component tree

```text
MarketingHomePage
├── WorkSection (#work)
│   ├── WorkSectionHeader
│   ├── WorkWall → ProjectCard*
│   ├── WorkEmptyState
│   └── WorkToServicesBridge
├── ServicesSection (#services)
│   ├── ServicesHeader
│   ├── ServicesEcosystem → ServiceCategoryCard*
│   └── ServicesClosing
└── FutureAnchors (#packages, #process, #contact)

/work/[slug]
└── CaseStudyView
    ├── CaseStudyHero
    ├── Challenge / Solution / Result
    ├── CaseStudyGallery (+ optional lightbox)
    ├── RelatedProjects
    └── CTA foundation
```
