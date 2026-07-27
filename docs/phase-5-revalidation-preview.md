# Phase 5 — Revalidation & Draft Preview

## Revalidation map

| Mutation                                                     | Paths                                       |
| ------------------------------------------------------------ | ------------------------------------------- |
| Settings                                                     | `/` (+ sitemap/robots when SEO keys change) |
| Project                                                      | `/`, `/work/[slug]`, `/sitemap.xml`         |
| Service / Package / Offer / Testimonial / Trust / Logo / FAQ | `/` (and structured data where applicable)  |

Helpers live in `src/server/services/revalidation.service.ts` and `src/server/admin/revalidation.ts`.

Public routes are currently `force-dynamic`; revalidation is a safety net for future ISR.

## Draft Mode preview

1. Authenticated admin clicks Preview → `enablePreviewAction` → Draft Mode cookie.
2. `/work/[slug]` loads published first; if missing and Draft Mode on, loads via preview helper.
3. Banner with exit action (`disablePreviewAction`).
4. Direct public requests without Draft Mode still `notFound()` for drafts.

No predictable public preview tokens.

### Fixed during browser verification

`generateMetadata` on `/work/[slug]` originally called `getPublishedProjectBySlug`
unconditionally, so the browser tab title/OG tags showed "المشروع غير موجود" while
previewing a draft even though the page body rendered the draft correctly. Fixed
to mirror the page component's draft-mode fallback (`getPublishedProjectBySlug` →
`getProjectBySlugForPreview` when Draft Mode is enabled). Verified live: enabling
preview on a draft project now shows the correct tab title and the orange
"وضع المعاينة مفعّل" banner with a working "إنهاء المعاينة" exit action.
