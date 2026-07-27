# Phase 4 — Commercial Architecture

## Data loading

`getCommercialLandingData()` loads packages, offers, testimonials, FAQs, and contact readiness in parallel.  
`getLandingPageData()` consumes it once (no per-section duplicate queries).

## Process content

Five process steps live in `src/lib/content/process-steps.ts` (typed local config). No new DB model.

## Server/client

Server: offer/pricing/process/testimonial/FAQ/final CTA content.  
Client: countdown, comparison tabs, FAQ accordion, lead funnel, sticky CTA.
