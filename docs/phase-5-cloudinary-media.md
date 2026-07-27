# Phase 5 — Cloudinary Media

## Configuration

Server-only env:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Validated in `src/lib/env/server.ts`. Secret never reaches the browser.

## Signed uploads

`getCloudinaryUploadSignatureAction` requires authenticated EDITOR+ and a whitelisted folder key.

Approved folders:

- `creative-marketing/projects/{sanitized-slug}`
- `creative-marketing/testimonials`
- `creative-marketing/client-logos`
- `creative-marketing/brand`
- `creative-marketing/hero`
- `creative-marketing/og`
- `creative-marketing/services`

## Lifecycle

1. Admin requests signature.
2. Browser POSTs to Cloudinary.
3. Metadata saved on `ProjectMedia` (publicId, resourceType, format, bytes, duration, …).
4. Detach from project does **not** destroy Cloudinary assets.
5. Explicit destroy requires permission, confirmation, and audit.

When Cloudinary is not configured, upload UI shows a disabled/config message and does not fake success.

## Live verification (2026-07-24)

**BLOCKED — credentials not configured**

`npm run admin:test-cloudinary` passes in configuration-only mode. No test assets were uploaded or left in Cloudinary.

## Fixed during browser verification: `next/image` unconfigured-host crash

`next.config.ts` only whitelists `res.cloudinary.com` in `images.remotePatterns`.
The manual "add from URL" fallback (used when Cloudinary isn't configured) lets an
admin paste **any** https URL, but `canUseNextImage()` in
`src/lib/media/public-media.ts` only checked that the URL was well-formed
http(s) — it did not check the hostname against the actual Next.js allowlist.
Result: publishing a project with a non-Cloudinary cover image (e.g. an Unsplash
URL) crashed the public `/work/[slug]` page with
`Invalid src prop … hostname is not configured under images`.

Fix: `canUseNextImage()` now also checks `parsed.hostname` against an explicit
`NEXT_IMAGE_ALLOWED_HOSTS` list (currently `res.cloudinary.com`, kept in sync
with `next.config.ts`). Non-Cloudinary URLs now correctly fall back to a plain
`<img>` tag (already wired in `case-study-hero.tsx`, `case-study-gallery.tsx`,
`case-study-lightbox.tsx`, `related-projects.tsx`, `project-media-preview.tsx`,
`service-category-card.tsx`) instead of crashing. Verified live: created a
project with an Unsplash cover URL, published it, and confirmed `/work/[slug]`
renders the hero and gallery correctly instead of erroring.
