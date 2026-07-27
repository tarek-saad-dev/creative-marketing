# Phase 5 — Browser Verification (5C update)

**Date:** 2026-07-24  
**URL:** http://localhost:3000 (PID 24460)

## Executed

- Login page without marketing chrome (after layout uses live admin).
- Wrong/empty credentials → generic Arabic error.
- Successful OWNER fixture login → dashboard with real counts + Cloudinary warning.
- Settings structured groups; invalid email/URL validation messages.
- Projects list + new project form.
- **Full project lifecycle (follow-up pass):** create → media manager (manual URL / Cloudinary-disabled message) → publication checklist → publish → public render → draft → Draft Mode preview banner/exit → cleanup.
- Audit log with filters and lead status correction entries.
- Services list (16 services) with actions.
- Homepage public safety (empty portfolio, no fake prices, FAQs visible).
- Lead status/audit trail re-verified.

## Blocked / incomplete

- Cloudinary live upload: **BLOCKED — credentials not configured**.
- Full packages/offers/testimonials/trust/logos/FAQ browser lifecycles.
- Tablet/narrow mobile viewport matrix.
- Exhaustive keyboard/a11y operator checklist.

## Defects fixed during verification

1. `requireRole` threw `UNAUTHORIZED` (500) instead of redirecting → now redirects.
2. Login redirected on any JWT without verifying DB admin → stale JWT login↔admin loop → login/layout now require live `getCurrentAdmin()`.
3. Public `/work/[slug]` crashed for non-Cloudinary cover URLs — `canUseNextImage()` now checks Next.js remote host allowlist and falls back to `<img>`.
4. Draft preview tab title said "المشروع غير موجود" — `generateMetadata` now respects Draft Mode like the page body.

## Hydration note

One intermittent hydration warning on `/admin/services` near dialog rendering; does not block build/lint.
