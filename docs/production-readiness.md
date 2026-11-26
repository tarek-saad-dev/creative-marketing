# Production readiness

## Automated checks
- npm ci
- npm run qa:unit
- npm run type-check
- npm run build (requires the normal build environment)
- npm run qa:smoke -- https://YOUR-PUBLIC-HOST
- npm install --no-save --package-lock=false playwright
- npx playwright install chromium
- npm run qa:browser -- https://YOUR-PUBLIC-HOST

Browser QA takes full-page screenshots at 1440, 390 and 320 pixels, verifies unique navigation targets, document overflow, service tab keyboard control, gallery dialog Escape and uncaught browser errors. It uses reduced motion for repeatability. The HTTP/browser checks do not open the lead funnel, because opening it creates a tracking session; submit test requests only against an isolated staging database. Screenshots require human visual review.

Lighthouse: run against the public deployment with the actual published content, mobile and desktop, record LCP/CLS/INP or lab TBT, and inspect image weights. No performance score claimed without measurement.

## Content / launch gate
- Supply the official CM logo (temporary text mark is still used).
- Publish approved project media, with rights, real captions and alt text; no fabricated client work.
- Add approved package amounts and confirm EGP per package in Admin. New package default is EGP; existing prices/currencies are deliberately not converted or overwritten.
- Set real WhatsApp international number, email, HTTPS social links, and NEXT_PUBLIC_SITE_URL for production.
- Run existing read-only content:audit-projects and commercial:verify on the intended database.
- Test lead session, form submission, saved request in admin CRM and explicit WhatsApp handoff on staging; verify production only with authorized test data.
- Verify actual real-device layout and compare sliders, mobile Safari and reduced motion.
- Confirm production deployment and rollback plan.

This change is source-level readiness work, not proof that the live website or its data has passed acceptance.
