# Phase 4 — Commercial Conversion Audit

**Date:** 2026-07-21  
**Live Neon snapshot (db:check / verify-landing):**

| Domain                    | Status                                             |
| ------------------------- | -------------------------------------------------- |
| Public priced packages    | **0** (correct)                                    |
| Draft packages            | **3** (THINK, CREATE, GROW; `originalPrice: null`) |
| Active offers             | **None seeded**                                    |
| Published testimonials    | **0**                                              |
| Active FAQs               | **9**                                              |
| WhatsApp / email / social | Keys exist; values empty                           |

## Architecture readiness

| Layer                    | Ready?  | Notes                                                              |
| ------------------------ | ------- | ------------------------------------------------------------------ |
| Package repo filter      | Partial | Price > 0 enforced; missing idealFor/feature completeness helper   |
| Offer status service     | Partial | upcoming/active/full/expired/disabled; no INVALID; no countdown UI |
| Pricing helpers          | Yes     | `hasValidConfiguredPrice`, `isValidPublicOfferPrice`               |
| Testimonials repo        | Partial | Missing `publishedAt` future guard; industry/media not selected    |
| FAQ repo                 | Yes     | Not rendered                                                       |
| Lead session + capture   | Yes     | No UI; no WhatsApp URL; sticky CTA only scrolls `#contact`         |
| WhatsApp message builder | Partial | Needs richer field set per Phase 4                                 |

## Anchors today

`#packages`, `#process`, `#contact` are calm placeholders in `FuturePhaseAnchors`.

## Proposed component tree

```text
CommercialSection
├── LimitedOfferSection (+ countdown client)
├── PricingSection (+ comparison client, package select)
├── ProcessSection (+ timeline motion client)
├── TestimonialsSection (omit if empty)
├── FAQSection (+ accordion client)
└── FinalConversionSection

LeadFunnelProvider (client boundary)
├── LeadDialog
└── triggers (pricing, sticky CTA, final CTA)
```

## Truthful fallbacks

- No public packages → inquiry CTA, no empty grid
- No active offer → hide urgency/countdown
- No testimonials → omit section + distributed slots
- No WhatsApp number → persist lead + copy-message fallback

## Schema gaps

None blocking. Process steps will use typed local config (not a new model).
