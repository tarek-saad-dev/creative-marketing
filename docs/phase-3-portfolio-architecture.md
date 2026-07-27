# Phase 3 — Portfolio Architecture

## Work Wall layout strategy

Deterministic roles via `assignWorkLayoutRoles(count)`:

| Count | Roles                                     |
| ----- | ----------------------------------------- |
| 0     | Empty state (no grid holes)               |
| 1     | LEAD                                      |
| 2     | LEAD, STANDARD                            |
| 3     | LEAD, PORTRAIT, PORTRAIT                  |
| 4     | LEAD, PORTRAIT, PORTRAIT, WIDE            |
| 5+    | LEAD, PORTRAIT, PORTRAIT, WIDE, STANDARD… |

Video-primary cards may prefer the WIDE slot when available.

## Publication rules

Shared `publishedProjectWhere` requires:

- `status = PUBLISHED`
- `publishedAt` present and ≤ now
- `deletedAt` null
- non-empty `slug`, `title`, `summary`
- non-empty `coverImageUrl`, `coverImageAlt`

Featured Work Wall adds `featured = true`.

Ordering: `displayOrder` → `publishedAt` → `id`.

## Repository methods

- `findFeaturedPublishedProjects` — card select (first media only)
- `findPublishedProjectBySlug` — full detail + ordered media + services
- `findPublishedProjectSlugs`
- `findRelatedPublishedProjects` — scored by shared services → industry → featured
- `findPublishedProjectsForServicePreviews`

## Server/client boundaries

- `WorkSection`, `WorkWall`, `ProjectCard`, `ServicesSection` — Server
- `ProjectMediaPreview`, `CaseStudyGallery`, `CaseStudyLightbox` — Client
