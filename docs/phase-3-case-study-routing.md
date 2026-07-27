# Phase 3 — Case Study Routing

## Decision

**Canonical shareable URLs:** `/work/[slug]`

**Modal / intercepting routes:** **Not implemented** in Phase 3.

Rationale: the marketing home lives in `(marketing)` without a parallel-route shell. Intercepting overlays would add fragile App Router complexity. Direct cinematic pages keep refresh, share, and SEO reliable.

## Behavior

- Work Wall cards link to `/work/[slug]`
- Direct load renders full case study with marketing header/footer
- Unpublished / incomplete / deleted / future `publishedAt` → `notFound()`
- `generateMetadata()` uses title, summary, cover when URL is usable
- `generateStaticParams()` returns published slugs when DB is reachable; empty array on failure
- Page uses `force-dynamic` for Neon-backed freshness

## Gallery

- Ordered `ProjectMedia` on detail only
- Mixed layout from aspect ratio + index
- Optional Headless UI lightbox (Escape, focus trap, keyboard arrows)
- Videos use controls in lightbox; muted preview on cards when used

## Related projects

Up to three published peers; omitted when none exist.
