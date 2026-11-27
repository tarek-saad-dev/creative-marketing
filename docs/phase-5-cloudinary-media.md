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

## Explicit live upload acceptance

The default `npm run admin:test-cloudinary` is config-only. On a trusted local environment with Cloudinary credentials already configured, run `npm run admin:test-cloudinary -- --live` to test a synthetic PNG in both library and project folders. Add `--video /path/to/synthetic.mp4` to also exercise video. Never use a customer file. The probe uses the same signed multipart upload fields as the CMS, validates the versioned delivery URL and metadata, fetches the asset, and destroys only the new returned public ID in the expected folder. No database records are created. An interrupted upload or unexpected public ID may require manual cleanup of QA assets. Live provider acceptance does not replace browser verification of registration, cover selection, and publication. No credentials are printed. Missing credentials fail explicitly in live mode.

### GitHub Actions live acceptance

Configure repository Actions secrets CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (reuse the intended site's Cloudinary credentials; never paste them into chat or source code). Once the workflow is merged into main, open Actions → Cloudinary live acceptance → Run workflow, select main and type RUN. The manual workflow generates a one-second synthetic video and checks images and videos. It cannot run from a pull request or non-main branch, and it writes no database rows. Test assets use unique QA subfolders for both library and project paths to avoid touching existing media. A green ordinary build or config-only test is not a substitute for a green live run. If credentials are missing, the live check fails rather than reporting success.
